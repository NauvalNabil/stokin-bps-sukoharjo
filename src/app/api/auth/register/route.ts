import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password, nip, team, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan gunakan email lain.' },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        nip: nip?.trim() || null,
        team: team || 'Subbagian Umum',
        phone: phone?.trim() || null,
        role: 'STAFF', // Self registered users default to STAFF
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
      { error: 'Gagal mendaftarkan akun' },
      { status: 500 }
    );
  }
}
