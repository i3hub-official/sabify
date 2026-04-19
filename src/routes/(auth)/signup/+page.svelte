<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import { activeUniversities, searchUniversities } from '$lib/stores/universities';
  import type { University } from '$lib/types/university';
  import jsQR from 'jsqr';

  import {
    Mail, Lock, User, ArrowRight, Eye, EyeOff,
    Briefcase, School, UserPlus, Check, X,
    ChevronRight, ChevronLeft, Phone, BookOpen,
    Building2, Zap, QrCode, Camera, Upload, RefreshCw
  } from 'lucide-svelte';

  onMount(() => {
    theme.init();
  });

  // ─── Form state ───────────────────────────────────────────────────
  let currentStep    = $state(1);
  let isLoading      = $state(false);
  let errorMessage   = $state('');
  let successMessage = $state('');

  // Step 1 – University
  let selectedUniversity = $state<University | null>(null);
  let searchQuery  = $state('');
  let showDropdown = $state(false);

  // MOUAU specific
  let isMouau        = $derived(selectedUniversity?.acronym === 'MOUAU');
  let mouauMatric    = $state('');
  let jambregNo      = $state('');
  let refNumber      = $state('');
  let qrLoading      = $state(false);
  let receiptData    = $state<Record<string, string> | null>(null);
  let receiptFetched = $state(false);

  // Webcam
  let showWebcam  = $state(false);
  let videoEl     = $state<HTMLVideoElement | null>(null);
  let camStream   = $state<MediaStream | null>(null);
  let scanInterval = $state<ReturnType<typeof setInterval> | null>(null);
  let camError    = $state('');
  let scanCanvas: HTMLCanvasElement;

  // Step 2 – Identity
  let surname      = $state('');
  let firstName    = $state('');
  let otherName    = $state('');
  let matricNumber = $state('');
  let faculty      = $state('');
  let department   = $state('');
  let phone        = $state('');
  let email        = $state('');

  // Step 3 – Security
  let password            = $state('');
  let confirmPassword     = $state('');
  let showPassword        = $state(false);
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
    return `/src/lib/data/uni-icons/${slug}.png`;
  }
  let logoError = $state(false);
  $effect(() => { if (selectedUniversity) logoError = false; });

  // ─── University search ────────────────────────────────────────────
  const filteredUniversities = $derived(
    searchQuery
      ? searchUniversities(searchQuery).slice(0, 10)
      : activeUniversities.slice(0, 10)
  );

  function selectUniversity(uni: University) {
    selectedUniversity = uni;
    searchQuery  = `${uni.name} (${uni.acronym})`;
    showDropdown = false;
    errorMessage = '';
    clearMouauData();
  }

  function clearUniversity() {
    selectedUniversity = null;
    searchQuery  = '';
    showDropdown = false;
    clearMouauData();
  }

  // ─── Clear helpers ────────────────────────────────────────────────
  function clearMouauData() {
    jambregNo      = '';
    mouauMatric    = '';
    refNumber      = '';
    receiptData    = null;
    receiptFetched = false;
    clearPrefilled();
  }

  function clearPrefilled() {
    surname      = '';
    firstName    = '';
    otherName    = '';
    jambregNo      = '';
    matricNumber = '';
    faculty      = '';
    department   = '';
  }

  function onMatricInput() {
    if (receiptFetched) {
      receiptData    = null;
      receiptFetched = false;
      refNumber      = '';
      clearPrefilled();
    }
  }

  function onRefInput() {
    if (receiptFetched) {
      receiptData    = null;
      receiptFetched = false;
      clearPrefilled();
    }
  }

  // ─── MOUAU receipt fetch ──────────────────────────────────────────
  async function fetchReceipt() {
    if (!mouauMatric.trim()) {
      errorMessage = 'Please enter your matric number first.';
      return;
    }
    const ref = refNumber.trim();
    if (!ref) {
      errorMessage = 'Please enter or scan the receipt ref number.';
      return;
    }
    qrLoading    = true;
    receiptData  = null;
    errorMessage = '';
    try {
      const res = await fetch(`/api/receipt?ref=${encodeURIComponent(ref)}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();

      // Validate matric matches receipt
      if (data.matricNo && !data.matricNo.replace(/\//g, '').includes(mouauMatric.replace(/\//g, '').trim())) {
        errorMessage = 'Matric number does not match this receipt. Please check and try again.';
        return;
      }

      receiptData    = data;
      receiptFetched = true;

      // Auto-fill — Nigerian school APIs return SURNAME FIRSTNAME OTHERNAME
      if (data.name) {
        const parts = (data.name as string).trim().split(/\s+/);
        surname = parts.slice(2).join(' ');
        firstName   = parts[0] ?? '';
        otherName = parts[1] ?? '';
              }
      if (data.matricNo)   matricNumber = data.matricNo;
      if (data.jambregNo)  jambregNo      = data.jambregNo;
      if (data.college)    faculty      = data.college;
      if (data.department) department   = data.department;
    } catch {
      errorMessage = 'Could not fetch receipt. Check the ref number and try again.';
    } finally {
      qrLoading = false;
    }
  }

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
      canvas.width  = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height);
      if (code?.data) {
        refNumber = code.data;
        await fetchReceipt();
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
    camError     = '';
    errorMessage = '';
    try {
      camStream  = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      showWebcam = true;
      await new Promise(r => setTimeout(r, 100));
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
      scanCanvas.width  = videoEl.videoWidth;
      scanCanvas.height = videoEl.videoHeight;
      const ctx = scanCanvas.getContext('2d')!;
      ctx.drawImage(videoEl, 0, 0);
      const imgData = ctx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height);
      if (code?.data) {
        stopWebcam();
        refNumber = code.data;
        fetchReceipt();
      }
    }, 300);
  }

  function stopWebcam() {
    if (scanInterval) clearInterval(scanInterval);
    if (camStream)    camStream.getTracks().forEach(t => t.stop());
    camStream  = null;
    showWebcam = false;
  }

  onDestroy(() => stopWebcam());

  // ─── Step navigation ──────────────────────────────────────────────
  function nextStep() {
    errorMessage = '';
    if (currentStep === 1) {
      if (!selectedUniversity) { errorMessage = 'Please select your university.'; return; }
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
    errorMessage   = '';
    successMessage = '';
    if (!password || password.length < 6) { errorMessage = 'Password must be at least 6 characters.'; return; }
    if (password !== confirmPassword)      { errorMessage = "Passwords don't match."; return; }

    isLoading = true;
    try {
      // TODO: connect to Better-Auth signup
      console.log('Signing up:', {
        university: selectedUniversity?.name,
        matricNumber, jambregNo, surname, firstName, otherName,
        faculty, department, phone, email, password
      });
      await new Promise(r => setTimeout(r, 1200));
      successMessage = 'Account created! Check your email to verify.';
      setTimeout(() => { window.location.href = '/signin'; }, 3000);
    } catch {
      errorMessage = 'Unable to create account. Email may already be registered.';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign up — Sabify</title>
  <meta name="description" content="Create your Sabify account. Join the future of campus life." />
</svelte:head>

<svelte:window on:click={(e) => {
  if (!(e.target as HTMLElement).closest('.university-search')) showDropdown = false;
}} />

<div class="auth-container">
  <div class="auth-card">

    <!-- Logo -->
    <div class="auth-header">
      <div class="logo">
        <div class="logo-mark">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z"
              stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M7 10.5L9.5 13L13.5 8"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="logo-text">Sabify</span>
      </div>
      <h1 class="auth-title">Create your account</h1>
      <p class="auth-subtitle">Join the future of campus life</p>
    </div>

    <!-- Stepper -->
    <div class="stepper">
      <div class="step" class:active={currentStep >= 1} class:done={currentStep > 1}>
        <div class="step-number">{#if currentStep > 1}<Check size={14} />{:else}1{/if}</div>
        <div class="step-label">University</div>
      </div>
      <div class="step-line" class:active={currentStep >= 2}></div>
      <div class="step" class:active={currentStep >= 2} class:done={currentStep > 2}>
        <div class="step-number">{#if currentStep > 2}<Check size={14} />{:else}2{/if}</div>
        <div class="step-label">Identity</div>
      </div>
      <div class="step-line" class:active={currentStep >= 3}></div>
      <div class="step" class:active={currentStep >= 3}>
        <div class="step-number">3</div>
        <div class="step-label">Security</div>
      </div>
    </div>

    <!-- Messages -->
    {#if errorMessage}
      <div class="message error"><X size={15} /><span>{errorMessage}</span></div>
    {/if}
    {#if successMessage}
      <div class="message success"><Check size={15} /><span>{successMessage}</span></div>
    {/if}

    <!-- ══════════════════════════════════════
         STEP 1: University
    ══════════════════════════════════════ -->
    {#if currentStep === 1}
      <div class="step-content">

        <div class="form-group">
          <label class="form-label">University</label>
          <div class="university-search">
            <div class="input-wrapper">
              <School size={17} class="input-icon" />
              <input
                type="text"
                bind:value={searchQuery}
                on:focus={() => (showDropdown = true)}
                on:input={() => (showDropdown = true)}
                placeholder="Search for your university…"
                class="form-input"
                autocomplete="off"
              />
              {#if selectedUniversity}
                <button type="button" class="clear-btn" on:click={clearUniversity}><X size={15} /></button>
              {/if}
            </div>

            {#if showDropdown && filteredUniversities.length > 0}
              <div class="dropdown">
                {#each filteredUniversities as uni}
                  <button type="button" class="dropdown-item" on:click={() => selectUniversity(uni)}>
                    <span class="dropdown-acronym">{uni.acronym}</span>
                    <span class="dropdown-name">{uni.name}</span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- Selected university card with logo -->
        {#if selectedUniversity}
          <div class="uni-card">
            <div class="uni-card-logo">
              {#if !logoError}
                <img
                  src={getLogoPath(selectedUniversity)}
                  alt={selectedUniversity.acronym}
                  on:error={() => (logoError = true)}
                />
              {:else}
                <span class="uni-initials">{selectedUniversity.acronym.slice(0, 2)}</span>
              {/if}
            </div>
            <div class="uni-card-info">
              <span class="uni-card-name">{selectedUniversity.name}</span>
              <span class="uni-card-acronym">{selectedUniversity.acronym}</span>
            </div>
            <Check size={16} class="uni-card-check" />
          </div>
        {/if}

        <!-- MOUAU auto-fill -->
        {#if isMouau}
          <div class="mouau-section">
            <div class="mouau-badge"><Zap size={12} /> MOUAU Auto-fill</div>

            <!-- 1. Matric first -->
            <div class="form-group">
              <label class="form-label">
                Matric number
                <span class="required">enter this first</span>
              </label>
              <div class="input-wrapper">
                <Briefcase size={17} class="input-icon" />
                <input
                  type="text"
                  bind:value={mouauMatric}
                  on:input={onMatricInput}
                  placeholder="e.g. 2021/249011"
                  class="form-input"
                />
              </div>
            </div>

            <!-- 2. Scan options — disabled until matric entered -->
            <div class="scan-block" class:locked={!mouauMatric.trim()}>
              <div class="scan-options-label">
                Scan school fee QR code
                {#if !mouauMatric.trim()}
                  <span class="scan-lock-hint">— enter matric number above first</span>
                {/if}
              </div>
              <div class="scan-btns">
                <button
                  type="button"
                  class="scan-btn"
                  on:click={startWebcam}
                  disabled={!mouauMatric.trim()}
                >
                  <Camera size={15} /> Live camera
                </button>
                <label class="scan-btn" class:disabled={!mouauMatric.trim()}>
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
              <p class="cam-error">{camError}</p>
            {/if}

            <!-- Webcam viewer -->
            {#if showWebcam}
              <div class="webcam-box">
                <div class="webcam-frame">
                  <!-- svelte-ignore a11y-media-has-caption -->
                  <video bind:this={videoEl} playsinline autoplay class="webcam-video"></video>
                  <div class="scan-reticle"></div>
                </div>
                <p class="webcam-hint">Point at the QR code on your school fee receipt</p>
                <button type="button" class="stop-cam-btn" on:click={stopWebcam}>
                  <X size={14} /> Cancel
                </button>
              </div>
            {/if}

            <!-- 3. Manual ref entry -->
            <div class="form-group">
              <label class="form-label">Or enter receipt ref number manually</label>
              <div class="input-wrapper">
                <QrCode size={17} class="input-icon" />
                <input
                  type="text"
                  bind:value={refNumber}
                  on:input={onRefInput}
                  placeholder="e.g. 8987874736744"
                  class="form-input ref-input"
                  disabled={!mouauMatric.trim()}
                />
                <button
                  type="button"
                  class="inline-fetch-btn"
                  on:click={fetchReceipt}
                  disabled={qrLoading || !refNumber.trim() || !mouauMatric.trim()}
                >
                  {#if qrLoading}
                    <span class="mini-spinner"></span>
                  {:else}
                    Fetch
                  {/if}
                </button>
              </div>
            </div>

            <!-- Receipt result -->
            {#if receiptData}
              <div class="receipt-result">
                <div class="receipt-label"><Check size={12} /> Receipt verified — fields auto-filled</div>
                <div class="receipt-rows">
                  {#each Object.entries(receiptData) as [key, val]}
                    {#if val}
                      <div class="receipt-row">
                        <span class="receipt-key">{key}</span>
                        <span class="receipt-val">{val}</span>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <button type="button" class="next-btn" on:click={nextStep} disabled={isLoading}>
          Continue <ChevronRight size={17} />
        </button>
      </div>
    {/if}

    <!-- ══════════════════════════════════════
         STEP 2: Identity
    ══════════════════════════════════════ -->
    {#if currentStep === 2}
      <div class="step-content">

        <!-- University banner -->
        {#if selectedUniversity}
          <div class="uni-banner">
            <div class="uni-banner-logo">
              {#if !logoError}
                <img src={getLogoPath(selectedUniversity)} alt="" on:error={() => (logoError = true)} />
              {:else}
                <span class="uni-initials sm">{selectedUniversity.acronym.slice(0, 2)}</span>
              {/if}
            </div>
            <span class="uni-banner-name">{selectedUniversity.name}</span>
          </div>
        {/if}

        {#if receiptFetched}
          <div class="prefill-notice">
            <Zap size={13} />
            <span>Fields marked 🔒 were filled from your receipt and cannot be edited.</span>
            <button
              type="button"
              class="re-scan-link"
              on:click={() => { receiptFetched = false; clearPrefilled(); currentStep = 1; }}
            >
              <RefreshCw size={12} /> Re-scan
            </button>
          </div>
        {/if}

        <div class="form-group">
          <label class="form-label">
            JAMB Registration number
            {#if receiptFetched}<span class="lock-icon">🔒</span>{/if}
          </label>
          <div class="input-wrapper">
            <Briefcase size={17} class="input-icon" />
            <input
              type="text"
              bind:value={jambregNo}
              placeholder="0123456789876AB"
              class="form-input"
              class:prefilled={receiptFetched}
              readonly={receiptFetched}
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            Matric / Registration number
            {#if receiptFetched}<span class="lock-icon">🔒</span>{/if}
          </label>
          <div class="input-wrapper">
            <Briefcase size={17} class="input-icon" />
            <input
              type="text"
              bind:value={matricNumber}
              placeholder="2021/249011"
              class="form-input"
              class:prefilled={receiptFetched}
              readonly={receiptFetched}
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              Surname {#if receiptFetched}<span class="lock-icon">🔒</span>{/if}
            </label>
            <div class="input-wrapper">
              <User size={17} class="input-icon" />
              <input
                type="text"
                bind:value={surname}
                placeholder="Adebayo"
                class="form-input"
                class:prefilled={receiptFetched}
                readonly={receiptFetched}
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">
              First name {#if receiptFetched}<span class="lock-icon">🔒</span>{/if}
            </label>
            <div class="input-wrapper">
              <User size={17} class="input-icon" />
              <input
                type="text"
                bind:value={firstName}
                placeholder="Oluwaseun"
                class="form-input"
                class:prefilled={receiptFetched}
                readonly={receiptFetched}
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            Other name(s)
            {#if receiptFetched}<span class="lock-icon">🔒</span>{:else}<span class="optional">optional</span>{/if}
          </label>
          <div class="input-wrapper">
            <User size={17} class="input-icon" />
            <input
              type="text"
              bind:value={otherName}
              placeholder="Middle name"
              class="form-input"
              class:prefilled={receiptFetched}
              readonly={receiptFetched}
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              Faculty / College {#if receiptFetched}<span class="lock-icon">🔒</span>{/if}
            </label>
            <div class="input-wrapper">
              <Building2 size={17} class="input-icon" />
              <input
                type="text"
                bind:value={faculty}
                placeholder="Engineering"
                class="form-input"
                class:prefilled={receiptFetched}
                readonly={receiptFetched}
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">
              Department {#if receiptFetched}<span class="lock-icon">🔒</span>{/if}
            </label>
            <div class="input-wrapper">
              <BookOpen size={17} class="input-icon" />
              <input
                type="text"
                bind:value={department}
                placeholder="Computer Science"
                class="form-input"
                class:prefilled={receiptFetched}
                readonly={receiptFetched}
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Phone number <span class="optional">optional</span></label>
          <div class="input-wrapper">
            <Phone size={17} class="input-icon" />
            <input type="tel" bind:value={phone} placeholder="+234 801 234 5678" class="form-input" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email address</label>
          <div class="input-wrapper">
            <Mail size={17} class="input-icon" />
            <input type="email" bind:value={email} placeholder="you@university.edu.ng" class="form-input" />
          </div>
        </div>

        <div class="button-group">
          <button type="button" class="back-btn" on:click={prevStep}>
            <ChevronLeft size={17} /> Back
          </button>
          <button type="button" class="next-btn" on:click={nextStep} disabled={isLoading}>
            Continue <ChevronRight size={17} />
          </button>
        </div>
      </div>
    {/if}

    <!-- ══════════════════════════════════════
         STEP 3: Security
    ══════════════════════════════════════ -->
    {#if currentStep === 3}
      <div class="step-content">

        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="input-wrapper">
            <Lock size={17} class="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              placeholder="Create a strong password"
              class="form-input"
              disabled={isLoading}
            />
            <button type="button" class="password-toggle" on:click={() => (showPassword = !showPassword)}>
              {#if showPassword}<EyeOff size={17} />{:else}<Eye size={17} />{/if}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Confirm password</label>
          <div class="input-wrapper">
            <Lock size={17} class="input-icon" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              bind:value={confirmPassword}
              placeholder="Confirm your password"
              class="form-input"
              disabled={isLoading}
            />
            <button type="button" class="password-toggle" on:click={() => (showConfirmPassword = !showConfirmPassword)}>
              {#if showConfirmPassword}<EyeOff size={17} />{:else}<Eye size={17} />{/if}
            </button>
          </div>
        </div>

        <div class="button-group">
          <button type="button" class="back-btn" on:click={prevStep} disabled={isLoading}>
            <ChevronLeft size={17} /> Back
          </button>
          <button type="button" class="submit-btn" on:click={handleSubmit} disabled={isLoading}>
            {#if isLoading}
              <span class="spinner"></span> Creating…
            {:else}
              <UserPlus size={17} /> Create account <ArrowRight size={17} />
            {/if}
          </button>
        </div>
      </div>
    {/if}

    <div class="divider">
      <span class="divider-line"></span>
      <span class="divider-text">or</span>
      <span class="divider-line"></span>
    </div>

    <button class="google-btn" type="button" disabled={isLoading}>
      <svg viewBox="0 0 24 24" width="17" height="17">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>

    <div class="toggle-mode">
      <span class="toggle-text">Already have an account?</span>
      <a href="/signin" class="toggle-link">Sign in</a>
    </div>

    <p class="terms-text">
      By signing up, you agree to our
      <a href="/terms">Terms of Service</a> and
      <a href="/privacy">Privacy Policy</a>.
    </p>
  </div>
</div>

<style>
  .auth-container {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 40px 20px;
    background: var(--bg-primary);
  }
  .auth-card {
    max-width: 500px; width: 100%;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 40px 32px;
  }

  /* ── Header ── */
  .auth-header { text-align: center; margin-bottom: 32px; }
  .logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
  .logo-mark {
    width: 40px; height: 40px; background: var(--purple-primary);
    border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white;
  }
  .logo-mark svg { width: 22px; height: 22px; }
  .logo-text {
    font-size: 22px; font-weight: 800; letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--purple-primary), var(--purple-accent));
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .auth-title  { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; color: var(--text-primary); margin-bottom: 6px; }
  .auth-subtitle { font-size: 14px; color: var(--text-secondary); }

  /* ── Stepper ── */
  .stepper { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 28px; }
  .step { display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .step-number {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--bg-primary); border: 2px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; color: var(--text-muted); transition: all 0.2s;
  }
  .step.active .step-number { background: var(--purple-primary); border-color: var(--purple-primary); color: white; }
  .step.done  .step-number  { background: #22c55e; border-color: #22c55e; color: white; }
  .step-label { font-size: 11px; color: var(--text-muted); }
  .step.active .step-label,
  .step.done  .step-label { color: var(--purple-primary); font-weight: 500; }
  .step-line { width: 40px; height: 2px; background: var(--border); transition: background 0.2s; }
  .step-line.active { background: var(--purple-primary); }

  /* ── Messages ── */
  .message {
    display: flex; align-items: center; gap: 9px;
    padding: 11px 15px; border-radius: 12px; margin-bottom: 20px; font-size: 13px;
  }
  .message.error   { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: #ef4444; }
  .message.success { background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3); color: #22c55e; }

  /* ── Form ── */
  .step-content { display: flex; flex-direction: column; gap: 18px; }
  .form-group   { display: flex; flex-direction: column; gap: 6px; }
  .form-row     { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-label   { font-size: 13px; font-weight: 500; color: var(--text-secondary); display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
  .optional     { font-size: 11px; color: var(--text-muted); font-weight: 400; }
  .required     { font-size: 11px; color: #f59e0b; font-weight: 400; }
  .lock-icon    { font-size: 12px; }

  .input-wrapper { position: relative; display: flex; align-items: center; }
  :global(.input-icon) { position: absolute; left: 13px; color: var(--text-muted); pointer-events: none; }

  .form-input {
    width: 100%; padding: 11px 12px 11px 40px;
    background: var(--bg-primary); border: 1px solid var(--border);
    border-radius: 12px; font-size: 14px; color: var(--text-primary); transition: border-color 0.15s;
  }
  .form-input:focus    { outline: none; border-color: var(--purple-primary); }
  .form-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .form-input.prefilled {
    background: var(--bg-secondary);
    border-color: rgba(109,99,255,0.2);
    color: var(--text-secondary);
    cursor: default;
  }

  .password-toggle, .clear-btn {
    position: absolute; right: 13px; background: none; border: none;
    color: var(--text-muted); cursor: pointer; padding: 0; display: flex; align-items: center;
  }
  .password-toggle:hover, .clear-btn:hover { color: var(--text-secondary); }

  /* ── University dropdown ── */
  .university-search { position: relative; }
  .dropdown {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0;
    background: var(--bg-primary); border: 1px solid var(--border);
    border-radius: 12px; max-height: 210px; overflow-y: auto; z-index: 20;
  }
  .dropdown-item {
    width: 100%; padding: 10px 14px; text-align: left;
    background: none; border: none; cursor: pointer;
    display: flex; gap: 10px; align-items: baseline; transition: background 0.12s;
  }
  .dropdown-item:hover { background: var(--bg-secondary); }
  .dropdown-acronym { font-weight: 700; color: var(--purple-primary); font-size: 12px; min-width: 56px; }
  .dropdown-name    { font-size: 13px; color: var(--text-primary); }

  /* ── University card ── */
  .uni-card {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 14px;
    background: var(--bg-primary); border: 1px solid rgba(109,99,255,0.25);
  }
  .uni-card-logo {
    width: 48px; height: 48px; border-radius: 10px;
    background: var(--bg-secondary); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;
  }
  .uni-card-logo img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
  .uni-initials      { font-size: 14px; font-weight: 700; color: var(--purple-primary); }
  .uni-initials.sm   { font-size: 11px; }
  .uni-card-info     { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .uni-card-name     { font-size: 13px; font-weight: 600; color: var(--text-primary); line-height: 1.3; }
  .uni-card-acronym  { font-size: 11px; color: var(--purple-primary); font-weight: 700; }
  :global(.uni-card-check) { color: #22c55e; flex-shrink: 0; }

  /* ── University banner (step 2) ── */
  .uni-banner {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 12px;
    background: var(--bg-primary); border: 1px solid var(--border);
  }
  .uni-banner-logo {
    width: 30px; height: 30px; border-radius: 7px; overflow: hidden;
    background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .uni-banner-logo img { width: 100%; height: 100%; object-fit: contain; padding: 2px; }
  .uni-banner-name     { font-size: 13px; font-weight: 500; color: var(--text-secondary); }

  /* ── MOUAU section ── */
  .mouau-section {
    display: flex; flex-direction: column; gap: 16px;
    padding: 18px; background: var(--bg-primary);
    border: 1px solid var(--border); border-radius: 14px;
  }
  .mouau-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 6px;
    background: rgba(109,99,255,.12); border: 1px solid rgba(109,99,255,.25);
    font-size: 11px; font-weight: 700; color: var(--purple-accent); letter-spacing: 0.04em;
  }

  /* ── Scan block ── */
  .scan-block { display: flex; flex-direction: column; gap: 8px; }
  .scan-block.locked { opacity: 0.6; }
  .scan-options-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
  .scan-lock-hint     { color: var(--text-muted); font-weight: 400; font-size: 11px; }
  .scan-btns  { display: flex; gap: 8px; flex-wrap: wrap; }
  .scan-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 9px; font-size: 12px; font-weight: 600;
    background: var(--bg-secondary); border: 1px solid var(--border);
    color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
  }
  .scan-btn:hover:not(:disabled):not(.disabled) { border-color: var(--purple-accent); color: var(--purple-primary); }
  .scan-btn:disabled, .scan-btn.disabled { pointer-events: none; }

  .ref-input { padding-right: 70px !important; }
  .inline-fetch-btn {
    position: absolute; right: 8px;
    padding: 5px 12px; border-radius: 8px;
    background: var(--purple-primary); color: white;
    border: none; cursor: pointer; font-size: 12px; font-weight: 600;
    display: flex; align-items: center; gap: 5px; transition: opacity 0.15s;
  }
  .inline-fetch-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Webcam ── */
  .webcam-box   { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .webcam-frame {
    position: relative; width: 100%; border-radius: 12px; overflow: hidden;
    background: #000; aspect-ratio: 4/3;
  }
  .webcam-video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .scan-reticle {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 170px; height: 170px;
    border: 2.5px solid var(--purple-primary);
    border-radius: 14px;
    box-shadow: 0 0 0 9999px rgba(0,0,0,0.45);
    pointer-events: none;
  }
  .webcam-hint  { font-size: 12px; color: var(--text-muted); text-align: center; }
  .stop-cam-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 9px; font-size: 12px; font-weight: 600;
    background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3);
    color: #ef4444; cursor: pointer; transition: opacity 0.15s;
  }
  .cam-error { font-size: 12px; color: #ef4444; }

  /* ── Receipt result ── */
  .receipt-result {
    padding: 12px 14px;
    background: rgba(34,211,160,.08); border: 1px solid rgba(34,211,160,.25); border-radius: 10px;
  }
  .receipt-label {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700; color: #22d3a0;
    letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px;
  }
  .receipt-rows { display: flex; flex-direction: column; gap: 4px; }
  .receipt-row  { display: flex; justify-content: space-between; font-size: 12px; gap: 8px; }
  .receipt-key  { color: var(--text-muted); text-transform: capitalize; }
  .receipt-val  { color: var(--text-primary); font-weight: 500; text-align: right; }

  /* ── Prefill notice ── */
  .prefill-notice {
    display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
    padding: 10px 13px; border-radius: 10px; font-size: 12px; color: var(--text-secondary);
    background: rgba(109,99,255,.07); border: 1px solid rgba(109,99,255,.18);
  }
  .re-scan-link {
    display: inline-flex; align-items: center; gap: 4px;
    background: none; border: none; color: var(--purple-primary);
    font-size: 12px; font-weight: 600; cursor: pointer; margin-left: auto; padding: 0;
  }

  /* ── Buttons ── */
  .button-group { display: flex; gap: 12px; margin-top: 6px; }
  .next-btn, .submit-btn {
    flex: 2; display: flex; align-items: center; justify-content: center; gap: 7px;
    padding: 13px 20px; background: var(--purple-primary); color: white;
    border: none; border-radius: 12px; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.15s; margin-top: 4px;
  }
  .next-btn:hover:not(:disabled),
  .submit-btn:hover:not(:disabled) { background: var(--purple-primary-dark, #6d28d9); transform: scale(0.99); }
  .next-btn:disabled, .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .back-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 13px 16px; background: transparent; color: var(--text-secondary);
    border: 1.5px solid var(--border); border-radius: 12px;
    font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; margin-top: 4px;
  }
  .back-btn:hover { border-color: var(--purple-accent); }
  .spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: white;
    animation: spin 0.6s linear infinite;
  }
  .mini-spinner {
    width: 11px; height: 11px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: white;
    animation: spin 0.6s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Divider + Google ── */
  .divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
  .divider-line { flex: 1; height: 1px; background: var(--border); }
  .divider-text { font-size: 12px; color: var(--text-muted); }
  .google-btn {
    display: flex; align-items: center; justify-content: center; gap: 9px;
    width: 100%; padding: 11px 20px;
    background: var(--bg-primary); border: 1px solid var(--border);
    border-radius: 12px; font-size: 14px; font-weight: 500; color: var(--text-primary);
    cursor: pointer; transition: all 0.15s;
  }
  .google-btn:hover:not(:disabled) { background: var(--bg-secondary); border-color: var(--purple-accent); }

  /* ── Footer ── */
  .toggle-mode {
    text-align: center; margin-top: 22px; padding-top: 22px;
    border-top: 1px solid var(--border); font-size: 13px; color: var(--text-secondary);
  }
  .toggle-link { color: var(--purple-primary); font-weight: 600; margin-left: 5px; text-decoration: none; }
  .toggle-link:hover { text-decoration: underline; }
  .terms-text { text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 16px; line-height: 1.6; }
  .terms-text a { color: var(--purple-primary); text-decoration: none; }
  .terms-text a:hover { text-decoration: underline; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }

  @media (max-width: 480px) {
    .auth-card { padding: 28px 20px; }
    .auth-title { font-size: 22px; }
    .form-row { grid-template-columns: 1fr; }
    .button-group { flex-direction: column; }
    .back-btn, .next-btn, .submit-btn { flex: unset; width: 100%; margin-top: 0; }
  }
</style>