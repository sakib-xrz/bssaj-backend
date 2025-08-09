import prisma from '../../utils/prisma';

// Generate agency code from name by taking first letter of each word
const generateAgencyCode = (agencyName: string): string => {
  // Generate code from agency name by taking first letter of each word
  return agencyName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 4); // Limit to 4 characters
};

// Generate serial number format: BSSAJ-{AGENCY_CODE}-{MMYY}-{SERIAL}
const generateSlNo = async (agencyId: string): Promise<string> => {
  // Get agency information
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { name: true },
  });

  if (!agency) {
    throw new Error('Agency not found');
  }

  // Generate agency code from name
  const agencyCode = generateAgencyCode(agency.name);

  // Get current month/year (MMYY format)
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);
  const monthYear = `${month}${year}`;

  // Find the latest certificate for this agency and month/year
  const latestCert = await prisma.certification.findFirst({
    where: {
      agency_id: agencyId,
      sl_no: {
        contains: `BSSAJ-${agencyCode}-${monthYear}`,
      },
    },
    orderBy: {
      sl_no: 'desc',
    },
  });

  // Extract serial number and increment
  let serialNumber = 1;
  if (latestCert) {
    const parts = latestCert.sl_no.split('-');
    if (parts.length === 4) {
      const lastSerial = parseInt(parts[3]);
      if (!isNaN(lastSerial)) {
        serialNumber = lastSerial + 1;
      }
    }
  }

  // Format serial number with leading zeros (4 digits)
  const formattedSerial = serialNumber.toString().padStart(4, '0');

  return `BSSAJ-${agencyCode}-${monthYear}-${formattedSerial}`;
};

const CertificationUtils = {
  generateSlNo,
  generateAgencyCode,
};

export default CertificationUtils;
