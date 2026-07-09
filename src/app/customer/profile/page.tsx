import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import ProfileClientView from "./ProfileClientView";

export default async function CustomerProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const userJwt: any = await verifyJwt(token as string);

  const user = await prisma.user.findUnique({
    where: { UserID: userJwt.userId }
  });

  if (!user) return <div>User not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-olive mb-8">My Profile</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-8">
          <div className="w-20 h-20 bg-gold text-olive rounded-full flex items-center justify-center text-3xl font-bold shadow-sm">
            {user.FirstName.charAt(0)}{user.LastName.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.FirstName} {user.LastName}</h2>
            <p className="text-gray-500">{user.Email}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Member since {user.DateRegistered.toLocaleDateString()}</p>
          </div>
        </div>

        <ProfileClientView initialUser={user} />
      </div>
    </div>
  );
}
