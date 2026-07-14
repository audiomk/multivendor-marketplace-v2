import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function VendorStorePage({
  params,
}: {
  params: { storeSlug: string };
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { storeSlug: params.storeSlug },
    select: {
      id: true,
      storeName: true,
      description: true,
      logoUrl: true,
      status: true,
      products: {
        where: { isActive: true },
        select: {   
          id: true,
          title: true,
          slug: true,
          price: true,
          images: { take: 1, orderBy: { position: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor || vendor.status !== "APPROVED") notFound();

  return (
    <div>
      <h1>{vendor.storeName}</h1>
      <p>{vendor.description}</p>
      {/* product grid using vendor.products */}
    </div>
  );
}