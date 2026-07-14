import { notFound } from "next/navigation";
import User from "@/lib/db/models/user.model"; // Adjust this path to your User model
import Product from "@/lib/db/models/product.model"; // Adjust this path to your Product model

// Define TypeScript interfaces for our response structure
interface PageProps {
  params: Promise<{ storeSlug: string }>; // In Next.js 15, params is a Promise and must be awaited
}

export default async function VendorStorePage({ params }: PageProps) {
  const { storeSlug } = await params;

  // 1. Find the vendor by their storeSlug inside vendorProfile
  const vendor = await User.findOne(
    { 
      "vendorProfile.storeSlug": storeSlug,
      "vendorProfile.isApproved": true 
    },
    {
      _id: 1,
      "vendorProfile.storeName": 1,
      "vendorProfile.bio": 1,
      "vendorProfile.logo": 1,
    }
  ).lean();

  // If vendor doesn't exist or isn't approved, return 404
  if (!vendor || !vendor.vendorProfile) {
    notFound();
  }

  // 2. Fetch the vendor's active products
  // (Assuming your Product model stores the vendor's ID in a 'vendorId' or 'user' field)
  const products = await Product.find(
    {
      vendorId: vendor._id, 
      isActive: true,
    },
    {
      title: 1,
      slug: 1,
      price: 1,
      images: { $slice: 1 }, // Grabs the first image from the array
    }
  )
    .sort({ createdAt: -1 }) // Sorts by descending order (newest first)
    .lean();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        {vendor.vendorProfile.logo && (
          <img 
            src={vendor.vendorProfile.logo} 
            alt={vendor.vendorProfile.storeName} 
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{vendor.vendorProfile.storeName}</h1>
          <p className="text-muted-foreground">{vendor.vendorProfile.bio}</p>
        </div>
      </div>

      {/* Render your products list using the 'products' array */}
    </div>
  );
}