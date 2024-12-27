import { Member } from '../../types';

export const devPrint = (...data: any[]): void => {
  if (import.meta.env.DEV) {
    console.log(...data);
  }
};

export const resolveName = (member: Member): string => {
  return member.firstName?.length === 0
    ? member.username
    : `${member.firstName} ${member.lastName}`;
};
