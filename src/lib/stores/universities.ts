// src/lib/stores/universities.ts
import type { University } from '$lib/types/university';
import universitiesData from '$lib/data/universities.json';

export const universities: University[] = universitiesData;

export const activeUniversities = universities.filter(u => u.active === true);

export const inactiveUniversities = universities.filter(u => u.active === false);

export function getUniversityById(id: string): University | undefined {
  return universities.find(u => u.id === id);
}

export function getUniversityByAcronym(acronym: string): University | undefined {
  return universities.find(u => u.acronym === acronym);
}

export function searchUniversities(query: string, includeInactive: boolean = false): University[] {
  const source = includeInactive ? universities : activeUniversities;
  const lowerQuery = query.toLowerCase();
  return source.filter(u => 
    u.name.toLowerCase().includes(lowerQuery) || 
    u.acronym.toLowerCase().includes(lowerQuery)
  );
}