import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password, nip, team, phone } = await req.json();

    if (!name || !name.trim() || !email || !email.trim() || !password) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password minimal 4 karakter' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan gunakan email lain atau langsung masuk.' },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: password,
        nip: nip?.trim() || null,
        team: team?.trim() || 'Subbagian Umum',
        phone: phone?.trim() || null,
        role: 'STAFF', // Setiap pendaftar baru otomatis role STAFF
      },
    });

    const { password: _, ...userData } = newUser;

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Gagal mendaftarkan akun baru' },
      { status: 500 }
    );
  }
}
