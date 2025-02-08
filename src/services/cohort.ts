import {
  CohortView,
  CohortCreate,
  CohortUpdate,
  RawMemberData,
} from '../types';
import { deserializeMember } from './member';
import api from './api';

interface RawCohortResponse {
  id: number;
  name: string;
  members: RawMemberData[];
}

function deserializeCohort(raw: RawCohortResponse): CohortView {
  return {
    id: raw.id,
    name: raw.name,
    members: raw.members.map(deserializeMember),
  };
}

export async function createCohort(cohort: CohortCreate): Promise<boolean> {
  const response = await api.post<RawCohortResponse>('/cohorts/', {
    name: cohort.name,
    members: cohort.memberIds,
  });

  return response.status === 201;
}

export async function getCohorts(): Promise<CohortView[]> {
  const response = await api.get<RawCohortResponse[]>('/cohorts/');
  return response.data.map(deserializeCohort);
}

export async function updateCohort(cohort: CohortUpdate): Promise<CohortView> {
  const response = await api.put<RawCohortResponse>(`/cohorts/${cohort.id}/`, {
    name: cohort.name,
    members: cohort.memberIds,
  });

  return deserializeCohort(response.data);
}

export async function deleteCohort(cohortId: string | number): Promise<void> {
  await api.delete(`/cohorts/${cohortId}/`);
}
