<!-- src/routes/(auth)/signup/page.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import { activeUniversities, searchUniversities } from '$lib/stores/universities';
	import type { University } from '$lib/types/university';
	import jsQR from 'jsqr';

	import {
		Mail,
		Lock,
		User,
		ArrowRight,
		Eye,
		EyeOff,
		Briefcase,
		School,
		UserPlus,
		Check,
		X,
		Home,
		ChevronLeft,
		Phone,
		BookOpen,
		Building2,
		Zap,
		QrCode,
		Camera,
		Upload,
		RefreshCw,
		Sparkles,
		ShieldCheck,
		AlertCircle
	} from 'lucide-svelte';

	onMount(() => {
		theme.init();
	});

	// ─── Form state ───────────────────────────────────────────────────
	let currentStep = $state(1);
	let isLoading = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	// ─── Flag to suppress onRefInput reset during programmatic updates ──
let settingFromScan = $state(false);

	// Step 1 – University
	let selectedUniversity = $state<University | null>(null);
	let searchQuery = $state('');
	let showDropdown = $state(false);

	// MOUAU specific
	let isMouau = $derived(selectedUniversity?.acronym === 'MOUAU');
	let mouauMatric = $state('');
	let jambregNo = $state('');
	// refNumber is internal only — never shown to the user after a QR scan
	let refNumber = $state('');
	let qrLoading = $state(false);
	let receiptData = $state<Record<string, string> | null>(null);
	let receiptFetched = $state(false);
	// When true the ref field shows "••••••••" instead of the raw value
	let refMasked = $state(false);

	// Webcam
	let showWebcam = $state(false);
	let videoEl = $state<HTMLVideoElement | null>(null);
	let camStream = $state<MediaStream | null>(null);
	let scanInterval = $state<ReturnType<typeof setInterval> | null>(null);
	let camError = $state('');
	let scanCanvas: HTMLCanvasElement;

	// Step 2 – Identity
	let surname = $state('');
	let firstName = $state('');
	let otherName = $state('');
	let matricNumber = $state('');
	let faculty = $state('');
	let department = $state('');
	let phone = $state('');
	let email = $state('');

	// Step 3 – Security
	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	// ─── University logo ──────────────────────────────────────────────
	function getLogoPath(uni: University | null): string | null {
		if (!uni) return null;
		const slug = uni.name
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '')
			.slice(0, 60);
		return `/uni-icons/${slug}.png`;
	}
	let logoError = $state(false);
	$effect(() => {
		if (selectedUniversity) logoError = false;
	});

	// ─── University search ────────────────────────────────────────────
	const filteredUniversities = $derived(
		searchQuery ? searchUniversities(searchQuery).slice(0, 10) : activeUniversities.slice(0, 10)
	);

	function selectUniversity(uni: University) {
		selectedUniversity = uni;
		searchQuery = `${uni.name} (${uni.acronym})`;
		showDropdown = false;
		errorMessage = '';
		clearMouauData();
	}

	function clearUniversity() {
		selectedUniversity = null;
		searchQuery = '';
		showDropdown = false;
		clearMouauData();
	}

	// ─── Clear helpers ────────────────────────────────────────────────
	function clearMouauData() {
		jambregNo = '';
		mouauMatric = '';
		refNumber = '';
		refMasked = false;
		receiptData = null;
		receiptFetched = false;
		clearPrefilled();
	}

	function clearPrefilled() {
		surname = '';
		firstName = '';
		otherName = '';
		jambregNo = '';
		matricNumber = '';
		faculty = '';
		department = '';
	}

	function onMatricInput() {
		if (receiptFetched) {
			receiptData = null;
			receiptFetched = false;
			refNumber = '';
			refMasked = false;
			clearPrefilled();
		}
	}

	function onRefInput() {
  // Ignore reactive triggers caused by scan/upload setting refNumber
  if (settingFromScan) return;

  const val = refNumber.trim();
  const looksLikeUrl =
    val.startsWith('http://') ||
    val.startsWith('https://') ||
    val.includes('transaction_ref=');
  if (looksLikeUrl) return;

  refMasked = false;
  if (receiptFetched) {
    receiptData = null;
    receiptFetched = false;
    clearPrefilled();
  }
}

	// ─── Extract ref from QR data ─────────────────────────────────────
	// MOUAU QR codes encode a full URL like:
	// https://apis.backend.mouau.edu.ng/api/printable-receipt?transaction_ref=090909090909
	// We only want the number after transaction_ref=
function extractRef(raw: string): string {
  const trimmed = raw.trim();

  // Case 1: full URL
  try {
    const u = new URL(trimmed);
    const ref = u.searchParams.get('transaction_ref');
    if (ref) return ref.trim();
  } catch {
    // Not a full URL, continue
  }

  // Case 2: bare query param (e.g. pasted "transaction_ref=090909")
  const match = trimmed.match(/[?&]?transaction_ref=([^&\s]+)/i);
  if (match) return match[1].trim();

  // Case 3: raw value — return as-is
  return trimmed;
}

	// ─── MOUAU receipt fetch ──────────────────────────────────────────
	// fromScan: when true, auto-advances to step 2 on success and never
	// shows the raw ref to the user
	async function fetchReceipt(fromScan = false) {
		if (!mouauMatric.trim()) {
			errorMessage = 'Please enter your matric number first.';
			return;
		}
		const ref = extractRef(refNumber.trim());
		if (!ref) {
			errorMessage = 'Please enter or scan the receipt ref number.';
			return;
		}

		qrLoading = true;
		receiptData = null;
		errorMessage = '';

		// Mask the ref field immediately so the raw value is never visible
		if (fromScan) refMasked = true;

		try {
			const res = await fetch(`/api/receipt?ref=${encodeURIComponent(ref)}`);
			if (!res.ok) throw new Error('Failed');
			const data = await res.json();

			if (
				data.matricNo &&
				!data.matricNo.replace(/\//g, '').includes(mouauMatric.replace(/\//g, '').trim())
			) {
				errorMessage = 'Matric number does not match this receipt. Please check and try again.';
				refMasked = false;
				return;
			}

			receiptData = data;
			receiptFetched = true;

			if (data.name) {
				const parts = (data.name as string).trim().split(/\s+/);
				surname = parts.slice(2).join(' ');
				firstName = parts[0] ?? '';
				otherName = parts[1] ?? '';
			}
			if (data.matricNo) matricNumber = data.matricNo;
			if (data.jambregNo) jambregNo = data.jambregNo;
			if (data.college) faculty = data.college;
			if (data.department) department = data.department;

			// Auto-advance only when triggered by QR scan (camera or gallery)
			if (fromScan) {
				currentStep = 2;
			}
		} catch {
			errorMessage = 'Could not fetch receipt. Check the ref number and try again.';
			refMasked = false;
		} finally {
			qrLoading = false;
		}
	}

	// ─── QR from gallery upload ───────────────────────────────────────
// ─── QR from gallery upload ───────────────────────────────────────
async function handleQrUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!mouauMatric.trim()) {
    errorMessage = 'Please enter your matric number before scanning.';
    return;
  }
  errorMessage = '';
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height);
    if (code?.data) {
      settingFromScan = true;            // ← suppress onRefInput
      refNumber = extractRef(code.data);
      settingFromScan = false;
      await fetchReceipt(true);
    } else {
      errorMessage = 'Could not read QR code. Please enter the ref number manually.';
    }
  } catch {
    errorMessage = 'Failed to process image. Try again or enter the ref manually.';
  }
}

	// ─── Webcam QR scanner ────────────────────────────────────────────
	async function startWebcam() {
		if (!mouauMatric.trim()) {
			errorMessage = 'Please enter your matric number before scanning.';
			return;
		}
		camError = '';
		errorMessage = '';
		try {
			camStream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});
			showWebcam = true;
			await new Promise((r) => setTimeout(r, 100));
			if (videoEl) {
				videoEl.srcObject = camStream;
				await videoEl.play();
				startScanLoop();
			}
		} catch {
			camError = 'Camera access denied. Please allow camera access or upload an image instead.';
		}
	}

	function startScanLoop() {
		scanCanvas = document.createElement('canvas');
		scanInterval = setInterval(() => {
			if (!videoEl || videoEl.readyState !== 4) return;
			scanCanvas.width = videoEl.videoWidth;
			scanCanvas.height = videoEl.videoHeight;
			const ctx = scanCanvas.getContext('2d')!;
			ctx.drawImage(videoEl, 0, 0);
			const imgData = ctx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
			const code = jsQR(imgData.data, imgData.width, imgData.height);
			if (code?.data) {
  stopWebcam();
  settingFromScan = true;              // ← suppress onRefInput
  refNumber = extractRef(code.data);
  settingFromScan = false;
  fetchReceipt(true);
}
		}, 300);
	}

	function stopWebcam() {
		if (scanInterval) clearInterval(scanInterval);
		if (camStream) camStream.getTracks().forEach((t) => t.stop());
		camStream = null;
		showWebcam = false;
	}

	onDestroy(() => stopWebcam());

	// ─── Step navigation ──────────────────────────────────────────────
	function nextStep() {
		errorMessage = '';
		if (currentStep === 1) {
			if (!selectedUniversity) {
				errorMessage = 'Please select your university.';
				return;
			}
			currentStep = 2;
		} else if (currentStep === 2) {
			if (!surname || !firstName || !matricNumber || !faculty || !department || !email) {
				errorMessage = 'Please fill in all required fields.';
				return;
			}
			currentStep = 3;
		}
	}

	function prevStep() {
		errorMessage = '';
		currentStep -= 1;
	}

	// ─── Submit ───────────────────────────────────────────────────────
	async function handleSubmit() {
		errorMessage = '';
		successMessage = '';
		if (!password || password.length < 6) {
			errorMessage = 'Password must be at least 6 characters.';
			return;
		}
		if (password !== confirmPassword) {
			errorMessage = "Passwords don't match.";
			return;
		}

		isLoading = true;
		try {
			console.log('Signing up:', {
				university: selectedUniversity?.name,
				matricNumber,
				jambregNo,
				surname,
				firstName,
				otherName,
				faculty,
				department,
				phone,
				email,
				password
			});
			await new Promise((r) => setTimeout(r, 1200));
			successMessage = 'Account created! Check your email to verify.';
			setTimeout(() => {
				window.location.href = '/signin';
			}, 3000);
		} catch {
			errorMessage = 'Unable to create account. Email may already be registered.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign up — Sabify</title>
</svelte:head>

<svelte:window
	onclick={(e) => {
		if (!(e.target as HTMLElement).closest('.university-search')) showDropdown = false;
	}}
/>

<!-- ── Root wrapper — drives the two-column layout ────────────────── -->
<div class="signup-page">
	<!-- ── Left brand panel ─────────────────────────────────────────── -->
	<aside class="si-panel">
		<div class="si-panel-inner">
			<div class="si-panel-hero">
				<div class="si-panel-badge"><Sparkles size={13} /><span>Join the movement</span></div>
				<h2 class="si-panel-headline">Your campus,<br /><em>reimagined.</em></h2>
				<p class="si-panel-desc">
					Past questions, dues, safety alerts — one place for every Nigerian student.
				</p>
			</div>
			<div class="si-features">
				<div class="si-feature-card">
					<div class="si-feature-icon"><BookOpen size={17} /></div>
					<div><strong>Verified Past Questions</strong><span>From every department</span></div>
				</div>
				<div class="si-feature-card">
					<div class="si-feature-icon"><Zap size={17} /></div>
					<div><strong>Instant Dues Payment</strong><span>With digital receipts</span></div>
				</div>
				<div class="si-feature-card">
					<div class="si-feature-icon"><ShieldCheck size={17} /></div>
					<div><strong>Campus Shield</strong><span>Real-time safety alerts</span></div>
				</div>
			</div>
			<div class="si-panel-footer">
				<div class="si-avatars">
					<div class="si-avatar" style="background:#a78bfa"></div>
					<div class="si-avatar" style="background:#7c3aed"></div>
					<div class="si-avatar" style="background:#6d28d9"></div>
					<div class="si-avatar" style="background:#5b21b6"></div>
					<div class="si-avatar-count">+8k</div>
				</div>
				<p>Trusted by students across Nigeria</p>
			</div>
		</div>
		<div class="si-panel-glow"></div>
	</aside>

	<!-- ── Right form side ──────────────────────────────────────────── -->
	<div class="si-main">
		<div class="si-form-shell">
			<a href="/" class="si-back-home">
				<ChevronLeft size={17} /><Home size={13} /><span>Back to Home</span>
			</a>

			<div class="si-mobile-brand">
				<div class="si-logo-mark sm">
					<svg viewBox="0 0 20 20" fill="none">
						<path
							d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linejoin="round"
						/>
						<path
							d="M7 10.5L9.5 13L13.5 8"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</div>
			</div>

			<div class="si-form-header">
				<h1 class="si-form-title">Create your account</h1>
				<p class="si-form-subtitle">Join the future of campus life</p>
			</div>

			<div class="si-card">
				<!-- Stepper -->
				<div class="si-steps">
					<div
						class="si-step-dot"
						class:active={currentStep >= 1}
						class:done={currentStep > 1}
					></div>
					<div class="si-step-line" class:filled={currentStep >= 2}></div>
					<div
						class="si-step-dot"
						class:active={currentStep >= 2}
						class:done={currentStep > 2}
					></div>
					<div class="si-step-line" class:filled={currentStep >= 3}></div>
					<div class="si-step-dot" class:active={currentStep >= 3}></div>
				</div>
				<div class="si-step-labels">
					<span class="si-step-label" class:active={currentStep >= 1}>University</span>
					<span class="si-step-label" class:active={currentStep >= 2}>Identity</span>
					<span class="si-step-label" class:active={currentStep >= 3}>Security</span>
				</div>

				{#if errorMessage}
					<div class="si-alert-error"><AlertCircle size={17} /><span>{errorMessage}</span></div>
				{/if}
				{#if successMessage}
					<div class="si-alert-success"><Check size={17} /><span>{successMessage}</span></div>
				{/if}

				<!-- ══ STEP 1: University ══ -->
				{#if currentStep === 1}
					<div class="si-step-body">
						<div class="si-welcome-msg">
							<School size={19} />
							<div>
								<strong>Find your university</strong><span
									>We support active institutions across Nigeria</span
								>
							</div>
						</div>

						<div class="si-field">
							<label class="si-label" for="university"
								>University <span class="si-req">*</span></label
							>
							<div class="university-search">
								<div class="si-input-wrap">
									<span class="si-input-icon"><School size={15} /></span>
									<input
										type="text"
										id="university"
										bind:value={searchQuery}
										on:focus={() => (showDropdown = true)}
										on:input={() => (showDropdown = true)}
										placeholder="Search for your university…"
										class="si-input"
										autocomplete="off"
									/>
									{#if selectedUniversity}
										<button type="button" class="si-clear-btn" onclick={clearUniversity}
											><X size={15} /></button
										>
									{/if}
								</div>
								{#if showDropdown && filteredUniversities.length > 0}
									<div class="si-dropdown">
										{#each filteredUniversities as uni}
											<button
												type="button"
												class="si-dropdown-item"
												onclick={() => selectUniversity(uni)}
											>
												<span class="si-dropdown-acronym">{uni.acronym}</span>
												<span class="si-dropdown-name">{uni.name}</span>
												{#if uni.isActive}<span class="si-active-tag">Active</span>{/if}
											</button>
										{/each}
									</div>
								{/if}
							</div>
						</div>

						{#if selectedUniversity}
							<div class="si-uni-card">
								<div class="si-uni-card-logo">
									{#if !logoError}
										<img
											src={getLogoPath(selectedUniversity)}
											alt={selectedUniversity.acronym}
											on:error={() => (logoError = true)}
										/>
									{:else}
										<span class="si-uni-initials">{selectedUniversity.acronym.slice(0, 2)}</span>
									{/if}
								</div>
								<div class="si-uni-card-info">
									<span class="si-uni-card-name">{selectedUniversity.name}</span>
									<div class="si-uni-card-meta">
										<span class="si-uni-card-acronym">{selectedUniversity.acronym}</span>
										{#if selectedUniversity.isActive}<span class="si-active-tag si-active-tag--card"
												>Active</span
											>{/if}
									</div>
								</div>
								<Check size={18} class="si-uni-card-check" />
							</div>
						{/if}

						{#if isMouau}
							<div class="si-mouau-section">
								<div class="si-mouau-badge"><Zap size={12} /> MOUAU Auto-fill</div>

								<div class="si-field">
									<label class="si-label">
										Matric number
										<span class="si-req-hint">enter this first</span>
									</label>
									<div class="si-input-wrap">
										<span class="si-input-icon"><Briefcase size={15} /></span>
										<input
											type="text"
											bind:value={mouauMatric}
											on:input={onMatricInput}
											placeholder="e.g. 2021/249011"
											class="si-input"
										/>
									</div>
								</div>

								<div class="si-scan-block" class:si-scan-block--locked={!mouauMatric.trim()}>
									<div class="si-scan-options-label">
										Scan school fee QR code
										{#if !mouauMatric.trim()}
											<span class="si-scan-lock-hint">— enter matric number above first</span>
										{/if}
									</div>
									<div class="si-scan-btns">
										<button
											type="button"
											class="si-scan-btn"
											onclick={startWebcam}
											disabled={!mouauMatric.trim()}
										>
											<Camera size={15} /> Live camera
										</button>
										<label class="si-scan-btn" class:disabled={!mouauMatric.trim()}>
											<Upload size={15} /> Upload image
											<input
												type="file"
												accept="image/*"
												class="sr-only"
												disabled={!mouauMatric.trim()}
												on:change={handleQrUpload}
											/>
										</label>
									</div>
								</div>

								{#if camError}
									<p class="si-cam-error">{camError}</p>
								{/if}

								{#if showWebcam}
									<div class="si-webcam-box">
										<div class="si-webcam-frame">
											<!-- svelte-ignore a11y-media-has-caption -->
											<video bind:this={videoEl} playsinline autoplay class="si-webcam-video"
											></video>
											<div class="si-scan-reticle"></div>
										</div>
										<p class="si-webcam-hint">Point at the QR code on your school fee receipt</p>
										<button type="button" class="si-stop-cam-btn" onclick={stopWebcam}>
											<X size={14} /> Cancel
										</button>
									</div>
								{/if}

								<div class="si-field">
									<label class="si-label">Or enter receipt ref number manually</label>
									<div class="si-input-wrap">
										<span class="si-input-icon"><QrCode size={15} /></span>
										<input
											type={refMasked ? 'password' : 'text'}
											value={refMasked ? '••••••••••••' : refNumber}
											on:input={(e) => {
												refNumber = (e.target as HTMLInputElement).value;
												onRefInput();
											}}
											placeholder="e.g. 8987874736744"
											class="si-input si-input--ref"
											class:si-input--masked={refMasked}
											disabled={!mouauMatric.trim() || qrLoading}
											readonly={refMasked}
										/>
										{#if qrLoading}
											<!-- Loading state — full width, no fetch button -->
											<div class="si-ref-scanning">
												<span class="si-mini-spinner"></span>
												<span>Verifying…</span>
											</div>
										{:else if !refMasked}
											<button
												type="button"
												class="si-inline-fetch-btn"
												onclick={() => fetchReceipt(false)}
												disabled={!refNumber.trim() || !mouauMatric.trim()}
											>
												Fetch
											</button>
										{:else}
											<!-- Scanned & masked — show a clear button so user can re-scan -->
											<button
												type="button"
												class="si-ref-clear-btn"
												onclick={() => {
													refNumber = '';
													refMasked = false;
													receiptData = null;
													receiptFetched = false;
													clearPrefilled();
												}}
												title="Clear scanned code"
											>
												<X size={13} />
											</button>
										{/if}
									</div>
								</div>

								{#if receiptData}
									<div class="si-receipt-result">
										<div class="si-receipt-label">
											<Check size={12} /> Receipt verified — fields auto-filled
										</div>
										<div class="si-receipt-rows">
											{#each Object.entries(receiptData) as [key, val]}
												{#if val}
													<div class="si-receipt-row">
														<span class="si-receipt-key">{key}</span>
														<span class="si-receipt-val">{val}</span>
													</div>
												{/if}
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{/if}

						<button
							type="button"
							class="si-btn-next si-btn-next--full"
							onclick={nextStep}
							disabled={isLoading}
						>
							Continue <ArrowRight size={15} />
						</button>
					</div>
				{/if}

				<!-- ══ STEP 2: Identity ══ -->
				{#if currentStep === 2}
					<div class="si-step-body">
						<div class="si-welcome-msg">
							<User size={19} />
							<div>
								<strong>Your academic identity</strong><span
									>Help us verify your student status</span
								>
							</div>
						</div>

						{#if selectedUniversity}
							<div class="si-uni-banner">
								<div class="si-uni-banner-logo">
									{#if !logoError}
										<img
											src={getLogoPath(selectedUniversity)}
											alt=""
											on:error={() => (logoError = true)}
										/>
									{:else}
										<span class="si-uni-initials sm">{selectedUniversity.acronym.slice(0, 2)}</span>
									{/if}
								</div>
								<div class="si-uni-banner-info">
									<span class="si-uni-banner-name">{selectedUniversity.name}</span>
									<span class="si-uni-banner-acronym">{selectedUniversity.acronym}</span>
								</div>
							</div>
						{/if}

						{#if receiptFetched}
							<div class="si-prefill-notice">
								<Zap size={13} />
								<span
									>Fields marked with the lock icon were filled from your receipt and cannot be
									edited.</span
								>
								<button
									type="button"
									class="si-rescan-link"
									onclick={() => {
										receiptFetched = false;
										clearPrefilled();
										currentStep = 1;
									}}
								>
									<RefreshCw size={12} /> Re-scan
								</button>
							</div>
						{/if}

						<div class="si-field">
							<label class="si-label">
								JAMB Registration Number
								{#if receiptFetched}<Lock size={14} class="si-lock-icon" />{/if}
							</label>
							<div class="si-input-wrap">
								<span class="si-input-icon"><Briefcase size={15} /></span>
								<input
									type="text"
									bind:value={jambregNo}
									placeholder="202551405692CF"
									class="si-input"
									class:si-input--prefilled={receiptFetched}
									readonly={receiptFetched}
									maxlength="15"
								/>
							</div>
						</div>

						<div class="si-field">
							<label class="si-label">
								Matric / Registration number
								{#if receiptFetched}<Lock size={14} class="si-lock-icon" />{/if}
							</label>
							<div class="si-input-wrap">
								<span class="si-input-icon"><Briefcase size={15} /></span>
								<input
									type="text"
									bind:value={matricNumber}
									placeholder="2021/249011"
									class="si-input"
									class:si-input--prefilled={receiptFetched}
									readonly={receiptFetched}
								/>
							</div>
						</div>

						<div class="si-form-row">
							<div class="si-field">
								<label class="si-label">
									Surname
									{#if receiptFetched}<Lock size={14} class="si-lock-icon" />{/if}
								</label>
								<div class="si-input-wrap">
									<span class="si-input-icon"><User size={15} /></span>
									<input
										type="text"
										bind:value={surname}
										placeholder="Adebayo"
										class="si-input"
										class:si-input--prefilled={receiptFetched}
										readonly={receiptFetched}
									/>
								</div>
							</div>
							<div class="si-field">
								<label class="si-label">
									First name
									{#if receiptFetched}<Lock size={14} class="si-lock-icon" />{/if}
								</label>
								<div class="si-input-wrap">
									<span class="si-input-icon"><User size={15} /></span>
									<input
										type="text"
										bind:value={firstName}
										placeholder="Oluwaseun"
										class="si-input"
										class:si-input--prefilled={receiptFetched}
										readonly={receiptFetched}
									/>
								</div>
							</div>
						</div>

						<div class="si-field">
							<label class="si-label">
								Other name(s)
								{#if receiptFetched}<Lock size={14} class="si-lock-icon" />{:else}<span
										class="si-optional">optional</span
									>{/if}
							</label>
							<div class="si-input-wrap">
								<span class="si-input-icon"><User size={15} /></span>
								<input
									type="text"
									bind:value={otherName}
									placeholder="Middle name"
									class="si-input"
									class:si-input--prefilled={receiptFetched}
									readonly={receiptFetched}
								/>
							</div>
						</div>

						<div class="si-form-row">
							<div class="si-field">
								<label class="si-label">
									Faculty / College
									{#if receiptFetched}<Lock size={14} class="si-lock-icon" />{/if}
								</label>
								<div class="si-input-wrap">
									<span class="si-input-icon"><Building2 size={15} /></span>
									<input
										type="text"
										bind:value={faculty}
										placeholder="Engineering"
										class="si-input"
										class:si-input--prefilled={receiptFetched}
										readonly={receiptFetched}
									/>
								</div>
							</div>
							<div class="si-field">
								<label class="si-label">
									Department
									{#if receiptFetched}<Lock size={14} class="si-lock-icon" />{/if}
								</label>
								<div class="si-input-wrap">
									<span class="si-input-icon"><BookOpen size={15} /></span>
									<input
										type="text"
										bind:value={department}
										placeholder="Computer Science"
										class="si-input"
										class:si-input--prefilled={receiptFetched}
										readonly={receiptFetched}
									/>
								</div>
							</div>
						</div>

						<div class="si-field">
							<label class="si-label">Phone number <span class="si-optional">optional</span></label>
							<div class="si-input-wrap">
								<span class="si-input-icon"><Phone size={15} /></span>
								<input
									type="tel"
									bind:value={phone}
									placeholder="+234 801 234 5678"
									class="si-input"
								/>
							</div>
						</div>

						<div class="si-field">
							<label class="si-label">Email address <span class="si-req">*</span></label>
							<div class="si-input-wrap">
								<span class="si-input-icon"><Mail size={15} /></span>
								<input
									type="email"
									bind:value={email}
									placeholder="you@university.edu.ng"
									class="si-input"
								/>
							</div>
						</div>

						<div class="si-actions">
							<button type="button" class="si-btn-back" onclick={prevStep}>
								<ChevronLeft size={15} /> Back
							</button>
							<button type="button" class="si-btn-next" onclick={nextStep} disabled={isLoading}>
								Continue <ArrowRight size={15} />
							</button>
						</div>
					</div>
				{/if}

				<!-- ══ STEP 3: Security ══ -->
				{#if currentStep === 3}
					<div class="si-step-body">
						<div class="si-welcome-msg">
							<ShieldCheck size={19} />
							<div><strong>Secure your account</strong><span>Create a strong password</span></div>
						</div>

						<div class="si-field">
							<label class="si-label" for="password">Password <span class="si-req">*</span></label>
							<div class="si-input-wrap">
								<span class="si-input-icon"><Lock size={15} /></span>
								<input
									type={showPassword ? 'text' : 'password'}
									id="password"
									bind:value={password}
									placeholder="Create a strong password"
									class="si-input si-input--toggle"
									disabled={isLoading}
								/>
								<button
									type="button"
									class="si-eye-btn"
									onclick={() => (showPassword = !showPassword)}
								>
									{#if showPassword}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
								</button>
							</div>
							<p class="si-hint">Minimum 6 characters</p>
						</div>

						<div class="si-field">
							<label class="si-label" for="confirm-password"
								>Confirm password <span class="si-req">*</span></label
							>
							<div class="si-input-wrap">
								<span class="si-input-icon"><Lock size={15} /></span>
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									id="confirm-password"
									bind:value={confirmPassword}
									placeholder="Confirm your password"
									class="si-input si-input--toggle"
									disabled={isLoading}
								/>
								<button
									type="button"
									class="si-eye-btn"
									onclick={() => (showConfirmPassword = !showConfirmPassword)}
								>
									{#if showConfirmPassword}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
								</button>
							</div>
						</div>

						<div class="si-actions">
							<button type="button" class="si-btn-back" onclick={prevStep} disabled={isLoading}>
								<ChevronLeft size={15} /> Back
							</button>
							<button
								type="button"
								class="si-btn-next si-btn-submit"
								onclick={handleSubmit}
								disabled={isLoading}
							>
								{#if isLoading}
									<span class="si-spinner"></span> Creating account…
								{:else}
									<UserPlus size={15} /> Create account <ArrowRight size={15} />
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</div>

			<p class="si-footer-text">
				Already have an account? <a href="/signin" class="si-link">Sign in</a>
			</p>
			<p class="si-terms-text">
				By signing up, you agree to our <a href="/terms">Terms of Service</a> and
				<a href="/privacy">Privacy Policy</a>.
			</p>
		</div>
	</div>
</div>

<style>
	/* Inherit all styles from layout.css and signin page, plus additions */
	:global(.si-page *),
	.signup-page * {
		font-family: 'DM Sans', system-ui, sans-serif;
		box-sizing: border-box;
	}

	.signup-page {
		display: flex;
		min-height: 100vh;
		background: var(--bg-primary);
	}

	/* Reuse signin panel styles */
	.si-panel {
		display: none;
		position: relative;
		width: 440px;
		flex-shrink: 0;
		background: linear-gradient(160deg, #1a0b2e 0%, #2d1b4e 50%, #1a0b2e 100%);
		overflow: hidden;
	}
	@media (min-width: 1024px) {
		.si-panel {
			display: flex;
		}
	}
	.si-panel-inner {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		padding: 2.5rem;
		height: 100%;
	}
	.si-panel-glow {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: radial-gradient(
			ellipse 80% 60% at 50% 50%,
			rgba(106, 44, 145, 0.25) 0%,
			transparent 70%
		);
		pointer-events: none;
	}

	.si-logo-link {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		margin-bottom: 2.5rem;
		transition: opacity 0.2s;
	}
	.si-logo-link:hover {
		opacity: 0.85;
	}
	.si-logo-mark {
		width: 42px;
		height: 42px;
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}
	.si-logo-mark svg {
		width: 22px;
		height: 22px;
	}
	.si-logo-mark.sm {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: var(--purple-primary);
		border-color: transparent;
		color: white;
	}
	.si-logo-mark.sm svg {
		width: 18px;
		height: 18px;
	}

	.si-wordmark {
		font-size: 20px;
		font-weight: 800;
		letter-spacing: -0.04em;
		color: white;
	}
	.si-wordmark.inline {
		color: var(--text-primary);
	}

	.si-panel-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.875rem;
		background: rgba(106, 44, 145, 0.25);
		border: 1px solid rgba(106, 44, 145, 0.4);
		border-radius: 100px;
		font-size: 0.75rem;
		color: #c4b5fd;
		margin-bottom: 1.5rem;
		width: fit-content;
	}
	.si-panel-headline {
		font-family: 'DM Serif Display', Georgia, serif;
		font-size: 2.5rem;
		line-height: 1.2;
		color: white;
		margin-bottom: 1rem;
	}
	.si-panel-headline em {
		color: #c4b5fd;
		font-style: italic;
	}
	.si-panel-desc {
		font-size: 0.875rem;
		line-height: 1.65;
		color: rgba(196, 181, 253, 0.82);
		margin-bottom: 2rem;
	}

	.si-features {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		margin-bottom: auto;
	}
	.si-feature-card {
		display: flex;
		align-items: flex-start;
		gap: 0.875rem;
		padding: 0.875rem 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 1rem;
		transition: background 0.2s;
	}
	.si-feature-card:hover {
		background: rgba(255, 255, 255, 0.09);
	}
	.si-feature-icon {
		width: 36px;
		height: 36px;
		background: rgba(106, 44, 145, 0.25);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #c4b5fd;
		flex-shrink: 0;
	}
	.si-feature-card strong {
		display: block;
		font-size: 0.813rem;
		font-weight: 600;
		color: white;
		margin-bottom: 0.2rem;
	}
	.si-feature-card span {
		font-size: 0.75rem;
		color: rgba(196, 181, 253, 0.8);
		line-height: 1.4;
	}

	.si-panel-footer {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}
	.si-avatars {
		display: flex;
		align-items: center;
		margin-bottom: 0.625rem;
	}
	.si-avatar {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 2px solid #2d1b4e;
		margin-left: -7px;
	}
	.si-avatar:first-child {
		margin-left: 0;
	}
	.si-avatar-count {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: rgba(106, 44, 145, 0.4);
		border: 2px solid #2d1b4e;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.625rem;
		font-weight: 700;
		color: white;
		margin-left: -7px;
	}
	.si-panel-footer p {
		font-size: 0.688rem;
		color: rgba(196, 181, 253, 0.65);
	}

	/* Form side */
	.si-main {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1.25rem;
		min-height: 100vh;
		background: var(--bg-primary);
	}
	.si-form-shell {
		width: 100%;
		max-width: 500px;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.si-back-home {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 100px;
		padding: 0.5rem 1rem;
		font-size: 0.813rem;
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		transition: all 0.2s;
		width: fit-content;
	}
	.si-back-home:hover {
		border-color: var(--purple-primary);
		color: var(--purple-on-light);
		background: var(--purple-light);
		transform: translateX(-2px);
	}

	.si-mobile-brand {
		display: none;
		align-items: center;
		gap: 8px;
		justify-content: center;
	}
	@media (max-width: 1023px) {
		.si-mobile-brand {
			display: flex;
		}
	}

	.si-form-header {
		text-align: center;
	}
	.si-form-title {
		font-family: 'DM Serif Display', Georgia, serif;
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		color: var(--text-primary);
		margin-bottom: 0.25rem;
		letter-spacing: -0.02em;
	}
	.si-form-subtitle {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.si-card {
		background: var(--bg-secondary);
		border-radius: 1.5rem;
		border: 1px solid var(--border);
		padding: clamp(1.25rem, 5vw, 2rem);
		box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.12);
	}

	/* Stepper */
	.si-steps {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.si-step-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--border);
		flex-shrink: 0;
		transition: all 0.3s ease;
	}
	.si-step-dot.active {
		background: var(--purple-primary);
		width: 24px;
		border-radius: 4px;
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple-primary) 20%, transparent);
	}
	.si-step-dot.done {
		background: var(--purple-primary-dark);
	}
	.si-step-line {
		flex: 1;
		height: 2px;
		background: var(--border);
		border-radius: 1px;
		transition: background 0.4s ease;
	}
	.si-step-line.filled {
		background: var(--purple-primary-dark);
	}
	.si-step-labels {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		padding: 0 0.25rem;
	}
	.si-step-label {
		font-size: 0.688rem;
		font-weight: 500;
		color: var(--text-muted);
	}
	.si-step-label.active {
		color: var(--purple-primary);
		font-weight: 600;
	}

	/* Messages */
	.si-alert-error {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.75rem 1rem;
		background: color-mix(in srgb, var(--error) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
		border-radius: 0.75rem;
		color: var(--error);
		font-size: 0.813rem;
		margin-bottom: 1.5rem;
	}
	.si-alert-success {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.75rem 1rem;
		background: color-mix(in srgb, var(--success) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--success) 30%, transparent);
		border-radius: 0.75rem;
		color: var(--success);
		font-size: 0.813rem;
		margin-bottom: 1.5rem;
	}

	/* Welcome message */
	.si-welcome-msg {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		background: var(--purple-light);
		border-radius: 1rem;
		margin-bottom: 1.5rem;
	}
	.si-welcome-msg :global(svg) {
		color: var(--purple-on-light);
		flex-shrink: 0;
	}
	.si-welcome-msg strong {
		display: block;
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--text-primary);
	}
	.si-welcome-msg span {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	/* Form fields */
	.si-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		margin-bottom: 1.125rem;
	}
	.si-label {
		font-size: 0.813rem;
		font-weight: 600;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex-wrap: wrap;
	}
	.si-req {
		color: var(--purple-primary);
		font-weight: 700;
	}
	.si-req-hint {
		font-size: 0.688rem;
		color: var(--text-muted);
		font-weight: 400;
		margin-left: 0.25rem;
	}
	.si-optional {
		font-size: 0.688rem;
		color: var(--text-muted);
		font-weight: 400;
	}
	.si-hint {
		font-size: 0.688rem;
		color: var(--text-muted);
	}

	.si-input-wrap {
		position: relative;
	}
	.si-input-icon {
		position: absolute;
		left: 0.875rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-muted);
		display: flex;
		align-items: center;
		pointer-events: none;
	}
	.si-input {
		width: 100%;
		padding: 0.75rem 0.875rem 0.75rem 2.625rem;
		border: 1.5px solid var(--border);
		border-radius: 0.75rem;
		font-size: 0.875rem;
		font-family: 'DM Sans', sans-serif;
		color: var(--text-primary);
		background: var(--bg-primary);
		transition: all 0.2s;
		outline: none;
	}
	.si-input:hover {
		border-color: var(--purple-accent);
	}
	.si-input:focus {
		border-color: var(--purple-primary);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple-primary) 12%, transparent);
	}
	.si-input--prefilled {
		background: var(--bg-tertiary);
		border-color: var(--border-light);
		color: var(--text-secondary);
		cursor: default;
	}
	.si-input--toggle {
		padding-right: 2.75rem;
	}
	.si-input--ref {
		padding-right: 70px !important;
	}

	.si-eye-btn {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-muted);
		padding: 0.25rem;
		transition: color 0.2s;
		display: flex;
	}
	.si-eye-btn:hover {
		color: var(--purple-primary);
	}
	.si-clear-btn {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-muted);
		padding: 0;
		display: flex;
		align-items: center;
	}
	.si-clear-btn:hover {
		color: var(--error);
	}

	.si-lock-icon {
		color: var(--text-muted);
		flex-shrink: 0;
	}

	/* Form row */
	.si-form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 0.25rem;
	}

	/* Buttons */
	.si-btn-next,
	.si-btn-submit {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.8125rem 1.25rem;
		background: var(--purple-primary);
		color: white;
		border: none;
		border-radius: 0.75rem;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 4px 14px color-mix(in srgb, var(--purple-primary) 35%, transparent);
		transition: all 0.2s;
	}
	.si-btn-next:hover:not(:disabled) {
		background: var(--purple-primary-dark);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px color-mix(in srgb, var(--purple-primary) 45%, transparent);
	}
	.si-btn-next:active:not(:disabled) {
		transform: translateY(0);
	}
	.si-btn-next:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}
	.si-btn-next--full {
		width: 100%;
	}
	.si-btn-submit {
		background: linear-gradient(135deg, var(--purple-primary) 0%, var(--purple-primary-dark) 100%);
	}

	.si-btn-back {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.75rem 1.125rem;
		background: var(--bg-primary);
		border: 1.5px solid var(--border);
		border-radius: 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}
	.si-btn-back:hover {
		border-color: var(--purple-primary);
		color: var(--purple-on-light);
		background: var(--purple-light);
		transform: translateX(-2px);
	}

	.si-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		margin-top: 0.5rem;
	}

	/* University dropdown */
	.university-search {
		position: relative;
	}
	.si-dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		max-height: 240px;
		overflow-y: auto;
		z-index: 20;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	}
	.si-dropdown-item {
		width: 100%;
		padding: 0.75rem 1rem;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		transition: background 0.12s;
		font-family: inherit;
	}
	.si-dropdown-item:hover {
		background: var(--bg-secondary);
	}
	.si-dropdown-acronym {
		font-weight: 700;
		color: var(--purple-on-light);
		font-size: 0.75rem;
		min-width: 56px;
	}
	.si-dropdown-name {
		font-size: 0.813rem;
		color: var(--text-primary);
		flex: 1;
		text-align: left;
	}
	.si-active-tag {
		font-size: 0.625rem;
		font-weight: 600;
		padding: 0.125rem 0.5rem;
		background: #22c55e;
		color: white;
		border-radius: 999px;
		letter-spacing: 0.02em;
		flex-shrink: 0;
	}
	.si-active-tag--card {
		background: #22c55e;
		font-size: 0.563rem;
		padding: 0.125rem 0.5rem;
	}

	/* University card */
	.si-uni-card {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 1rem 1.25rem;
		background: var(--bg-primary);
		border: 1px solid var(--purple-light-border);
		border-radius: 1rem;
		margin-top: 0.5rem;
	}
	.si-uni-card-logo {
		width: 48px;
		height: 48px;
		border-radius: 10px;
		background: var(--bg-tertiary);
		border: 1px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		flex-shrink: 0;
	}
	.si-uni-card-logo img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 4px;
	}
	.si-uni-initials {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--purple-primary);
	}
	.si-uni-initials.sm {
		font-size: 0.688rem;
	}
	.si-uni-card-info {
		flex: 1;
	}
	.si-uni-card-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		display: block;
		margin-bottom: 0.25rem;
	}
	.si-uni-card-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.si-uni-card-acronym {
		font-size: 0.688rem;
		color: var(--purple-on-light);
		font-weight: 600;
	}
	.si-uni-card-check {
		color: #22c55e;
		flex-shrink: 0;
	}

	/* University banner (step 2) */
	.si-uni-banner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: 0.875rem;
		margin-bottom: 1rem;
	}
	.si-uni-banner-logo {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		background: var(--bg-tertiary);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		flex-shrink: 0;
	}
	.si-uni-banner-logo img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 2px;
	}
	.si-uni-banner-info {
		flex: 1;
	}
	.si-uni-banner-name {
		font-size: 0.813rem;
		font-weight: 600;
		color: var(--text-primary);
		display: block;
	}
	.si-uni-banner-acronym {
		font-size: 0.688rem;
		color: var(--purple-on-light);
	}

	/* MOUAU section */
	.si-mouau-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: 1rem;
		margin-top: 0.5rem;
	}
	.si-mouau-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.75rem;
		background: color-mix(in srgb, var(--purple-primary) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--purple-primary) 25%, transparent);
		border-radius: 6px;
		font-size: 0.688rem;
		font-weight: 700;
		color: var(--purple-on-light);
		width: fit-content;
	}

	.si-scan-block {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.si-scan-block--locked {
		opacity: 0.6;
	}
	.si-scan-options-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-secondary);
	}
	.si-scan-lock-hint {
		color: var(--text-muted);
		font-weight: 400;
		font-size: 0.688rem;
	}
	.si-scan-btns {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.si-scan-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s;
		font-family: inherit;
	}
	.si-scan-btn:hover:not(:disabled) {
		border-color: var(--purple-accent);
		color: var(--purple-primary);
	}
	.si-scan-btn:disabled,
	.si-scan-btn.disabled {
		pointer-events: none;
		opacity: 0.5;
	}

	.si-inline-fetch-btn {
		position: absolute;
		right: 0.5rem;
		bottom: 0.8rem;
		padding: 0.375rem 0.875rem;
		border-radius: 0.5rem;
		background: var(--purple-primary);
		color: white;
		border: none;
		cursor: pointer;
		font-size: 0.75rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		transition: opacity 0.15s;
		font-family: inherit;
	}
	.si-inline-fetch-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Webcam */
	.si-webcam-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.625rem;
	}
	.si-webcam-frame {
		position: relative;
		width: 100%;
		border-radius: 0.75rem;
		overflow: hidden;
		background: #000;
		aspect-ratio: 4/3;
	}
	.si-webcam-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.si-scan-reticle {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 150px;
		height: 150px;
		border: 2px solid var(--purple-primary);
		border-radius: 0.75rem;
		box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45);
		pointer-events: none;
	}
	.si-webcam-hint {
		font-size: 0.688rem;
		color: var(--text-muted);
		text-align: center;
	}
	.si-stop-cam-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		background: color-mix(in srgb, var(--error) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
		color: var(--error);
		cursor: pointer;
		font-family: inherit;
	}
	.si-cam-error {
		font-size: 0.75rem;
		color: var(--error);
	}

	/* Receipt result */
	.si-receipt-result {
		padding: 0.75rem 1rem;
		background: color-mix(in srgb, var(--success) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--success) 25%, transparent);
		border-radius: 0.75rem;
	}
	.si-receipt-label {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.688rem;
		font-weight: 700;
		color: var(--success);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		margin-bottom: 0.5rem;
	}
	.si-receipt-rows {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.si-receipt-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		gap: 0.5rem;
	}
	.si-receipt-key {
		color: var(--text-muted);
		text-transform: capitalize;
	}
	.si-receipt-val {
		color: var(--text-primary);
		font-weight: 500;
		text-align: right;
	}

	/* Prefill notice */
	.si-prefill-notice {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		padding: 0.625rem 0.875rem;
		border-radius: 0.75rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
		background: color-mix(in srgb, var(--purple-primary) 7%, transparent);
		border: 1px solid color-mix(in srgb, var(--purple-primary) 18%, transparent);
		margin-bottom: 1rem;
	}
	.si-rescan-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: none;
		border: none;
		color: var(--purple-on-light);
		font-size: 0.688rem;
		font-weight: 600;
		cursor: pointer;
		margin-left: auto;
		padding: 0;
		font-family: inherit;
	}

	/* Spinner */
	.si-spinner {
		width: 15px;
		height: 15px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		flex-shrink: 0;
	}
	.si-mini-spinner {
		width: 10px;
		height: 10px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		display: inline-block;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Footer */
	.si-footer-text {
		text-align: center;
		font-size: 0.875rem;
		color: var(--text-secondary);
	}
	.si-terms-text {
		text-align: center;
		font-size: 0.688rem;
		color: var(--text-muted);
		margin-top: 0.75rem;
		line-height: 1.5;
	}
	.si-terms-text a {
		color: var(--purple-primary);
		text-decoration: none;
	}
	.si-terms-text a:hover {
		text-decoration: underline;
	}

	.si-link {
		color: var(--purple-primary);
		font-weight: 500;
		text-decoration: none;
	}
	.si-link:hover {
		text-decoration: underline;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.si-main {
			padding: 1.5rem 1rem;
			align-items: flex-start;
		}
		.si-form-shell {
			gap: 1.25rem;
		}
		.si-card {
			border-radius: 1.25rem;
			padding: 1.25rem;
		}
		.si-actions {
			flex-direction: column-reverse;
		}
		.si-btn-back,
		.si-btn-next {
			width: 100%;
			justify-content: center;
		}
		.si-back-home {
			font-size: 0.75rem;
			padding: 0.375rem 0.875rem;
		}
		.si-form-row {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}
		.si-step-labels {
			display: none;
		}
	}
	.si-input--masked {
		letter-spacing: 0.2em;
		color: var(--text-muted);
		cursor: default;
	}
	.si-ref-scanning {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.688rem;
		color: var(--purple-primary);
		font-weight: 600;
		pointer-events: none;
	}
	.si-ref-clear-btn {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-muted);
		display: flex;
		align-items: center;
		padding: 0.25rem;
		border-radius: 4px;
		transition: color 0.15s;
	}
	.si-ref-clear-btn:hover {
		color: var(--error);
	}
</style>
