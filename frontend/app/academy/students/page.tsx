'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Users, Search, Download, RefreshCw, ArrowLeft, Mail, Building, Calendar, CheckCircle2 } from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  organization: string
  enrolledAt: string
  source?: string
}

export default function AcademyStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchStudents = async () => {
    try {
      setRefreshing(true)
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const res = await fetch(`${backendUrl}/api/academy/students`)
      const data = await res.json()
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students)
      }
    } catch (e) {
      console.error('Failed to fetch students:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.organization && s.organization.toLowerCase().includes(search.toLowerCase()))
  )

  const handleExportCSV = () => {
    if (!students.length) return
    const headers = ['Name', 'Email', 'Organization', 'Enrolled Date', 'Source']
    const rows = students.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${(s.organization || '').replace(/"/g, '""')}"`,
      `"${new Date(s.enrolledAt).toLocaleString()}"`,
      `"${s.source || 'web_academy'}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `tripsage_academy_students_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#1A1A1A] font-body flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E0D8] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/academy"
                className="text-xs font-bold text-[#EA580C] hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Academy
              </Link>
              <span className="text-slate-300">·</span>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-[10px] font-extrabold uppercase tracking-wider">
                Admin Directory
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight flex items-center gap-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span>Enrolled Students</span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                {students.length} Total
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E]">
              Live roster of all students enrolled in TripSage Academy — Foundations of AGI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStudents}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E8E0D8] text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!students.length}
              className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export to CSV
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E8E0D8] text-sm text-[#1A1A1A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent shadow-2xs"
          />
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl border border-[#E8E0D8] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading student directory...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              {students.length === 0
                ? 'No students enrolled yet. Once someone enrolls on the Academy page, their details will show here immediately.'
                : 'No students matching your search.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FFFBF7] border-b border-[#E8E0D8] text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Student</th>
                    <th className="py-3.5 px-6">Email</th>
                    <th className="py-3.5 px-6">College / Company</th>
                    <th className="py-3.5 px-6">Enrolled At</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D8]">
                  {filtered.map((student) => (
                    <tr key={student.id || student.email} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#1A1A1A]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-[#EA580C] font-extrabold flex items-center justify-center text-xs">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{student.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{student.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{student.organization || '—'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(student.enrolledAt).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Enrolled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
