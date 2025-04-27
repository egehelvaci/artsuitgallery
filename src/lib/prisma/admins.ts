import { prisma } from "../db";
import { hash, compare } from "bcrypt";

// Admin kullanıcısını email'e göre bul
export async function getAdminByEmail(email: string) {
  return await prisma.admin.findUnique({
    where: { email },
  });
}

// Admin kullanıcısını ID'ye göre bul
export async function getAdminById(id: string) {
  return await prisma.admin.findUnique({
    where: { id },
  });
}

// Kimlik doğrulama
export async function verifyAdminCredentials(email: string, password: string) {
  const admin = await getAdminByEmail(email);
  
  if (!admin) {
    return null;
  }
  
  const isValid = await compare(password, admin.password);
  
  if (!isValid) {
    return null;
  }
  
  // Password'ü hariç tut
  const { password: _, ...adminWithoutPassword } = admin;
  
  return adminWithoutPassword;
}

// Admin oluştur
export async function createAdmin(data: {
  email: string;
  password: string;
  name?: string;
}) {
  const hashedPassword = await hash(data.password, 10);
  
  return await prisma.admin.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
}

// Admin güncelle
export async function updateAdmin(
  id: string,
  data: {
    email?: string;
    name?: string;
  }
) {
  return await prisma.admin.update({
    where: { id },
    data,
  });
}

// Admin şifresini güncelle
export async function updateAdminPassword(id: string, newPassword: string) {
  const hashedPassword = await hash(newPassword, 10);
  
  return await prisma.admin.update({
    where: { id },
    data: {
      password: hashedPassword,
    },
  });
}

// Tüm adminleri listele
export async function getAllAdmins() {
  return await prisma.admin.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
} 