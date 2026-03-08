import { prisma } from './db';

export async function identifyContact(email?: string, phoneNumber?: string) {
    if (!email && !phoneNumber) {
        throw new Error('Either email or phoneNumber must be provided.');
    }

    // 1. Find initial matches
    const initialMatches = await prisma.contact.findMany({
        where: {
            OR: [
                ...(email ? [{ email }] : []),
                ...(phoneNumber ? [{ phoneNumber }] : [])
            ]
        }
    });

    // 2. If no matches, create a new primary contact
    if (initialMatches.length === 0) {
        const newContact = await prisma.contact.create({
            data: {
                email,
                phoneNumber,
                linkPrecedence: 'primary'
            }
        });

        return {
            contact: {
                primaryContactId: newContact.id,
                emails: newContact.email ? [newContact.email] : [],
                phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
                secondaryContactIds: []
            }
        };
    }

    // 3. Gather cluster: Find all associated primary contacts
    const matchedRootIds = new Set(initialMatches.map((c: any) => c.linkedId || c.id));
    
    // Fetch all contacts in the cluster
    const cluster = await prisma.contact.findMany({
        where: {
            OR: [
                { id: { in: Array.from(matchedRootIds) } },
                { linkedId: { in: Array.from(matchedRootIds) } }
            ]
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    // 4. Identify the oldest primary contact in the cluster
    const primaries = cluster.filter((c: any) => c.linkPrecedence === 'primary');
    // Already ordered by createdAt asc
    let oldestPrimary = primaries[0];
    
    if (!oldestPrimary) {
        oldestPrimary = cluster[0]; 
    }

    const newerPrimaries = primaries.filter((p: any) => p.id !== oldestPrimary.id);

    // Update newer primary contacts to secondary and point their dependents to the oldest primary
    if (newerPrimaries.length > 0) {
        const newerPrimaryIds = newerPrimaries.map((p: any) => p.id);

        await prisma.contact.updateMany({
            where: {
                id: { in: newerPrimaryIds }
            },
            data: {
                linkPrecedence: 'secondary',
                linkedId: oldestPrimary.id,
                updatedAt: new Date()
            }
        });

        await prisma.contact.updateMany({
            where: {
                linkedId: { in: newerPrimaryIds }
            },
            data: {
                linkedId: oldestPrimary.id,
                updatedAt: new Date()
            }
        });

        // Update local cluster state to reflect DB updates
        cluster.forEach((c: any) => {
            if (newerPrimaryIds.includes(c.id)) {
                c.linkPrecedence = 'secondary';
                c.linkedId = oldestPrimary.id;
            } else if (c.linkedId && newerPrimaryIds.includes(c.linkedId)) {
                c.linkedId = oldestPrimary.id;
            }
        });
    }

    // 5. Check if incoming request has a NEW email or phone number
    const existingEmails = new Set(cluster.map((c: any) => c.email).filter(Boolean));
    const existingPhones = new Set(cluster.map((c: any) => c.phoneNumber).filter(Boolean));

    const isNewEmail = email && !existingEmails.has(email);
    const isNewPhone = phoneNumber && !existingPhones.has(phoneNumber);

    if (email && phoneNumber && (isNewEmail || isNewPhone)) {
        const newSecondary = await prisma.contact.create({
            data: {
                email,
                phoneNumber,
                linkedId: oldestPrimary.id,
                linkPrecedence: 'secondary'
            }
        });
        cluster.push(newSecondary);
    }

    // 6. Consolidate final output structure
    const allEmails = new Set<string>();
    const allPhones = new Set<string>();
    
    // Add primary contact info first
    if (oldestPrimary.email) allEmails.add(oldestPrimary.email);
    if (oldestPrimary.phoneNumber) allPhones.add(oldestPrimary.phoneNumber);

    // Add secondary contact info
    const secondaryIds: number[] = [];
    for (const c of cluster) {
        if (c.id !== oldestPrimary.id) {
            secondaryIds.push(c.id);
            if (c.email) allEmails.add(c.email);
            if (c.phoneNumber) allPhones.add(c.phoneNumber);
        }
    }

    return {
        contact: {
            primaryContactId: oldestPrimary.id,
            emails: Array.from(allEmails),
            phoneNumbers: Array.from(allPhones),
            secondaryContactIds: secondaryIds
        }
    };
}