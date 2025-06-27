import { MemberKind } from '@prisma/client';
import prisma from '../../utils/prisma';

const MemberKindMap = {
  [MemberKind.ADVISER]: 'AD',
  [MemberKind.HONORABLE]: 'HO',
  [MemberKind.EXECUTIVE]: 'EX',
  [MemberKind.ASSOCIATE]: 'AS',
  [MemberKind.STUDENT_REPRESENTATIVE]: 'SR',
};

const GenerateMemberId = async (kind: MemberKind) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  const dateString = `${year}${month}${day}`;
  const kindPrefix = MemberKindMap[kind];

  const lastMember = await prisma.member.findFirst({
    where: {
      kind,
    },
    orderBy: {
      created_at: 'desc',
    },
    select: {
      member_id: true,
    },
  });

  let serial = '01';

  if (lastMember) {
    const lastSerial = lastMember.member_id.split('-')[3];
    serial = (parseInt(lastSerial) + 1).toString().padStart(2, '0');
  }

  return `BSSAJ-${dateString}-${kindPrefix}-${serial}`;
};

const MemberUtils = {
  GenerateMemberId,
};

export default MemberUtils;
