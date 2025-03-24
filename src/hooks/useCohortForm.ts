import { useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getCohortById, updateCohort, createCohort } from '../services/cohort';
import { getAllMembers } from '../services/member';
import { Member } from '../types';

interface FormState {
  name: string;
  memberIds: number[];
  isLoading: boolean;
  isSaving: boolean;
}

interface MemberState {
  members: Member[];
  isLoading: boolean;
  searchQuery: string;
}

export function useCohortForm(cohortId?: string) {
  const navigate = useNavigate();
  const toast = useToast();
  const isEditMode = Boolean(cohortId);

  const [formState, setFormState] = useState<FormState>({
    name: '',
    memberIds: [],
    isLoading: false,
    isSaving: false,
  });

  const [memberState, setMemberState] = useState<MemberState>({
    members: [],
    isLoading: false,
    searchQuery: '',
  });

  async function loadCohort() {
    if (!isEditMode) return;

    setFormState((prev) => ({ ...prev, isLoading: true }));
    try {
      const cohortIdNum = parseInt(cohortId!);
      const cohort = await getCohortById(cohortIdNum);
      setFormState((prev) => ({
        ...prev,
        name: cohort.name,
        memberIds: cohort.members.map((m) => m.id),
        isLoading: false,
      }));
    } catch (error) {
      toast({
        title: 'Error loading cohort',
        status: 'error',
        duration: 3000,
      });
      navigate('/admin/cohorts');
    }
  }

  useEffect(() => {
    loadCohort();
  }, [cohortId, isEditMode, navigate, toast]);

  const loadMembers = async () => {
    setMemberState((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await getAllMembers();
      setMemberState((prev) => ({
        ...prev,
        members: data,
        isLoading: false,
      }));
    } catch (error) {
      toast({
        title: 'Error loading members',
        status: 'error',
        duration: 3000,
      });
      setMemberState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = memberState.members
    .filter((member) => {
      const searchLower = memberState.searchQuery.toLowerCase();
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      return (
        !memberState.searchQuery ||
        fullName.includes(searchLower) ||
        member.username.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aToggled = formState.memberIds.includes(a.id);
      const bToggled = formState.memberIds.includes(b.id);
      if (aToggled === bToggled) {
        return a.firstName.localeCompare(b.firstName);
      }
      return aToggled ? -1 : 1;
    });

  const toggleMember = (memberId: number) => {
    setFormState((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...prev.memberIds, memberId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.name.trim()) {
      toast({
        title: 'Please enter a cohort name',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setFormState((prev) => ({ ...prev, isSaving: true }));
    try {
      const cohortData = {
        name: formState.name.trim(),
        memberIds: formState.memberIds,
      };

      if (isEditMode) {
        await updateCohort({
          id: parseInt(cohortId!),
          ...cohortData,
        });
      } else {
        await createCohort(cohortData);
      }

      toast({
        title: `Cohort ${isEditMode ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 3000,
      });

      navigate('/admin/cohorts');
    } catch (error) {
      toast({
        title: `Failed to ${isEditMode ? 'update' : 'create'} cohort`,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setFormState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const updateName = (name: string) => {
    setFormState((prev) => ({ ...prev, name }));
  };

  const updateSearchQuery = (query: string) => {
    setMemberState((prev) => ({ ...prev, searchQuery: query }));
  };

  return {
    formState,
    memberState,
    filteredMembers,
    isEditMode,
    toggleMember,
    handleSubmit,
    updateName,
    updateSearchQuery,
    loadMembers,
  };
}
