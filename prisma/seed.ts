import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    // const fakeUserData = Array.from({ length: 1000 }).map(() => {
    //     const createUser: any = {
    //         name: faker.name.fullName(),
    //         whatsappNumber: faker.phone.number(),
    //         address: faker.address.streetAddress(),
    //         role: faker.helpers.arrayElement(['ADMIN', 'USER', 'CASHIER']),
    //         email: faker.internet.email(),
    //         password: 'Maklo123!',
    //     }
    //     return createUser;
    // });
    
    // await prisma.user.createMany({
    //     data: fakeUserData,
    //     skipDuplicates: true,
    // });

    const users = await prisma.user.findMany({
        select: { id: true },
    });
    const userIds = users.map(user => user.id);

    const fakeResiData = Array.from({ length: 1000 }).map(() => {
        const statusCod = faker.datatype.boolean();
        const jumlahCod = statusCod ? faker.number.int({ min: 10000, max: 500000 }) : 0;

        const resiData: any = {
            userId: faker.helpers.arrayElement(userIds),
            noResi: faker.string.alphanumeric(10).toUpperCase(),
            tanggalDiterima: faker.date.between({
                from: new Date('2025-01-01'),
                to: new Date('2025-05-01'),
            }),
            posisiPaket: faker.helpers.arrayElement(['Gudang Balikpapan', 'ITCI']),
            statusCod: faker.datatype.boolean(),
            statusPaket: faker.helpers.arrayElement(['DIPROSES', 'DITERIMA']),
            estimasiTiba: faker.date.between({
                from: new Date('2025-01-01'),
                to: new Date('2025-05-01'),
            }),
        };

        if (statusCod && jumlahCod !== 0) {
            resiData.cod = {
                create: {
                    jumlahCod,
                    statusPembayaran: faker.helpers.arrayElement(['BELUM_BAYAR', 'SUDAH_BAYAR']),
                    methodPembayaran: faker.helpers.arrayElement(['CASH', 'QRIS', 'TRANSFER']),
                    tanggalPembayaran: faker.date.recent({ days: 7 }),
                },
            };
        }

        return resiData;
    });

    for (const resi of fakeResiData) {
        await prisma.resi.create({ data: resi });
    }

    console.log('✅ Seeded 100 resi entries with conditional COD data');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

