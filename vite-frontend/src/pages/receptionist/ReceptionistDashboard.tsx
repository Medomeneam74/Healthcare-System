import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Wifi, Stethoscope, ClipboardList, RefreshCw, ArrowRight, Building2, Pencil, X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { NfcScanModal } from '@/components/nfc/NfcScanModal'
import type { Patient, Doctor, WeekDay } from '@/types'
import client from '@/api/client'
import { useToast } from '@/components/ui/Toast'

const DAYS: WeekDay[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function isAvailableNow(doctor: Doctor): boolean {
  // No schedule configured → assume always available
  if (!doctor.workingHours?.length) return true
  const now = new Date()
  const today = DAYS[now.getDay()]
  const hours = doctor.workingHours.find(h => h.day === today)
  // Has a schedule but not working today → unavailable
  if (!hours) return false
  const pad = (n: number) => n.toString().padStart(2, '0')
  const current = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  return current >= hours.start && current <= hours.end
}

function AvailabilityDot({ doctor }: { doctor: Doctor }) {
  return isAvailableNow(doctor)
    ? <span className="inline-block h-2 w-2 rounded-full bg-sev-none-fg animate-pulse" title={doctor.workingHours?.length ? 'Available now' : 'No schedule — assumed available'} />
    : <span className="inline-block h-2 w-2 rounded-full bg-sev-critical-fg" title="Outside working hours" />
}

export default function ReceptionistDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const VALID_TABS = ['queue', 'doctors']
  const hashTab = location.hash.replace('#', '')
  const activeTab = VALID_TABS.includes(hashTab) ? hashTab : 'queue'
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchDoctor, setSearchDoctor] = useState('')

  const [nfcOpen, setNfcOpen] = useState(false)
  const [scannedPatient, setScannedPatient] = useState<Patient | null>(null)
  const [assignDoctor, setAssignDoctor] = useState('')
  const [assignDept, setAssignDept] = useState('')
  const [assigning, setAssigning] = useState(false)

  const [queue, setQueue] = useState<{ patient: Patient; doctor: Doctor }[]>([])
  const [queueLoading, setQueueLoading] = useState(false)
  const queueIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [reassignEntry, setReassignEntry] = useState<{ patientId: string; fromDoctorId: string } | null>(null)
  const [reassignTo, setReassignTo] = useState('')
  const [reassigning, setReassigning] = useState(false)

  useEffect(() => {
    fetchDoctors()
    return () => {
      if (queueIntervalRef.current) clearInterval(queueIntervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (doctors.length === 0) return
    fetchQueue(doctors)
    if (queueIntervalRef.current) clearInterval(queueIntervalRef.current)
    queueIntervalRef.current = setInterval(() => fetchQueue(doctors), 30_000)
  }, [doctors])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const res = await client.get('/admin-hospital/doctors')
      const d = res.data
      setDoctors(Array.isArray(d) ? d : d.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  const fetchQueue = useCallback(async (doctorList: Doctor[]) => {
    setQueueLoading(true)
    try {
      const results = await Promise.allSettled(
        doctorList.map(d => client.get(`/receptionist/doctor/${d._id}/patients`))
      )
      const entries: { patient: Patient; doctor: Doctor }[] = []
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          const patients: Patient[] = r.value.data?.data ?? r.value.data ?? []
          patients.forEach(p => entries.push({ patient: p, doctor: doctorList[i] }))
        }
      })
      setQueue(entries)
    } finally {
      setQueueLoading(false)
    }
  }, [])

  const handleAssign = async () => {
    if (!scannedPatient || !assignDoctor) return
    setAssigning(true)
    try {
      await client.post('/receptionist/assign-patient', {
        patientId: scannedPatient._id,
        doctorId: assignDoctor,
      })
      toast({ title: 'Patient assigned to doctor', variant: 'success' })
      const assignedDoc = doctors.find(d => d._id === assignDoctor)
      if (assignedDoc && scannedPatient) {
        setQueue(prev => {
          const exists = prev.some(e => e.patient._id === scannedPatient._id && e.doctor._id === assignedDoc._id)
          return exists ? prev : [...prev, { patient: scannedPatient, doctor: assignedDoc }]
        })
      }
      setScannedPatient(null)
      setAssignDoctor('')
      setAssignDept('')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      toast({ title: e?.response?.data?.message ?? 'Failed to assign patient', variant: 'error' })
    } finally {
      setAssigning(false)
    }
  }

  const handleReassign = async () => {
    if (!reassignEntry || !reassignTo) return
    setReassigning(true)
    try {
      await client.patch('/receptionist/reassign-patient', {
        patientId:    reassignEntry.patientId,
        fromDoctorId: reassignEntry.fromDoctorId,
        toDoctorId:   reassignTo,
      })
      toast({ title: 'Patient reassigned successfully', variant: 'success' })
      const newDoc = doctors.find(d => d._id === reassignTo)
      setQueue(prev => prev.map(e =>
        e.patient._id === reassignEntry.patientId && e.doctor._id === reassignEntry.fromDoctorId
          ? newDoc ? { patient: e.patient, doctor: newDoc } : e
          : e
      ))
      setReassignEntry(null)
      setReassignTo('')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      toast({ title: e?.response?.data?.message ?? 'Failed to reassign patient', variant: 'error' })
    } finally {
      setReassigning(false)
    }
  }

  const uniqueDepartments = [...new Set(doctors.map(d => d.department).filter(Boolean))] as string[]

  const filteredDoctors = doctors.filter(d => {
    const q = searchDoctor.toLowerCase()
    return d.firstName.toLowerCase().includes(q) || d.lastName.toLowerCase().includes(q) || d.email.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <NfcScanModal
        open={nfcOpen}
        onOpenChange={setNfcOpen}
        onPatientFound={p => setScannedPatient(p)}
      />

      <Tabs value={activeTab} onValueChange={tab => navigate(`${location.pathname}#${tab}`, { replace: true })}>
        <TabsList>
          <TabsTrigger value="queue">
            <ClipboardList className="h-4 w-4 mr-1.5" />Queue Manager
          </TabsTrigger>
          <TabsTrigger value="doctors">
            <Stethoscope className="h-4 w-4 mr-1.5" />Doctors
          </TabsTrigger>
        </TabsList>

        {/* Queue Tab */}
        <TabsContent value="queue">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>NFC Patient Check-In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setNfcOpen(true)} className="w-full h-12 text-base gap-2">
                  <Wifi className="h-5 w-5 rotate-90" />
                  Scan NFC Card
                </Button>

                {scannedPatient ? (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-sidebar p-4 text-white">
                      <p className="text-xs text-sidebar-muted mb-2">Identified Patient</p>
                      <p className="text-xl font-bold">{scannedPatient.firstName} {scannedPatient.lastName}</p>
                      <p className="text-sm text-sidebar-muted">ID: {scannedPatient.nationalId}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-white/70">
                        <span>Blood: {scannedPatient.bloodType ?? 'Unknown'}</span>
                        <span>Gender: {scannedPatient.gender}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Filter by Department</Label>
                      <Select
                        value={assignDept}
                        onValueChange={v => { setAssignDept(v); setAssignDoctor('') }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All departments</SelectItem>
                          {uniqueDepartments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Label>Forward to Doctor</Label>
                      {(() => {
                        const available = doctors.filter(d =>
                          (!assignDept || assignDept === 'all' || d.department === assignDept)
                          && isAvailableNow(d)
                        )
                        return available.length === 0 ? (
                          <div className="rounded-lg border border-sev-high-line bg-sev-high-bg px-3 py-2.5 text-xs text-sev-high-fg">
                            No doctors available right now in this department.
                          </div>
                        ) : (
                          <Select value={assignDoctor} onValueChange={setAssignDoctor}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select available doctor..." />
                            </SelectTrigger>
                            <SelectContent>
                              {available.map(d => (
                                <SelectItem key={d._id} value={d._id}>
                                  Dr. {d.firstName} {d.lastName}
                                  {d.department && ` — ${d.department}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      })()}

                      <Button
                        className="w-full"
                        onClick={handleAssign}
                        disabled={!assignDoctor || assigning}
                      >
                        {assigning ? <Spinner size="sm" /> : 'Assign to Doctor'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-canvas-subtle flex items-center justify-center mb-3">
                      <Wifi className="h-8 w-8 text-ink-faint rotate-90" />
                    </div>
                    <p className="text-sm text-ink-muted">Scan a patient card to begin</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Active Queue
                    {queue.length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-accent text-white text-xs font-bold">
                        {queue.length}
                      </span>
                    )}
                  </CardTitle>
                  <button
                    onClick={() => fetchQueue(doctors)}
                    disabled={queueLoading}
                    className="p-1.5 rounded-lg hover:bg-canvas-subtle text-ink-muted hover:text-gray-600 transition-colors disabled:opacity-50"
                    title="Refresh queue"
                  >
                    <RefreshCw className={`h-4 w-4 ${queueLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {queueLoading && queue.length === 0 ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : queue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-12 w-12 rounded-full bg-canvas-subtle flex items-center justify-center mb-3">
                      <ClipboardList className="h-6 w-6 text-ink-faint" />
                    </div>
                    <p className="text-sm text-ink-muted">No patients in queue</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {queue.map((entry, i) => {
                      const isReassigning = reassignEntry?.patientId === entry.patient._id && reassignEntry?.fromDoctorId === entry.doctor._id
                      const otherDoctors = doctors.filter(d => d._id !== entry.doctor._id && isAvailableNow(d))
                      return (
                        <div key={`${entry.patient._id}-${entry.doctor._id}-${i}`}
                          className="rounded-xl border border-line-subtle bg-canvas-subtle overflow-hidden"
                        >
                          <div className="flex items-center gap-3 px-3 py-2.5">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-bold text-accent">
                              {i + 1}
                            </span>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {entry.patient.firstName} {entry.patient.lastName}
                              </p>
                            </div>

                            <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-ink-faint" />

                            <div className="flex-1 min-w-0 text-right">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                Dr. {entry.doctor.firstName} {entry.doctor.lastName}
                              </p>
                              {entry.doctor.department && (
                                <p className="text-xs text-accent truncate">{entry.doctor.department}</p>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                if (isReassigning) { setReassignEntry(null); setReassignTo('') }
                                else { setReassignEntry({ patientId: entry.patient._id, fromDoctorId: entry.doctor._id }); setReassignTo('') }
                              }}
                              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-canvas text-ink-muted hover:text-accent transition-colors"
                              title={isReassigning ? 'Cancel reassign' : 'Reassign to another doctor'}
                            >
                              {isReassigning ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                            </button>
                          </div>

                          {isReassigning && (
                            <div className="border-t border-line-subtle px-3 py-2.5 bg-canvas space-y-2">
                              <p className="text-xs font-semibold text-ink-secondary">Reassign to another doctor</p>
                              {otherDoctors.length === 0 ? (
                                <p className="text-xs text-sev-high-fg bg-sev-high-bg border border-sev-high-line rounded-lg px-2.5 py-2">
                                  No other available doctors right now.
                                </p>
                              ) : (
                                <Select value={reassignTo} onValueChange={setReassignTo}>
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Select doctor…" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {otherDoctors.map(d => (
                                      <SelectItem key={d._id} value={d._id}>
                                        Dr. {d.firstName} {d.lastName}
                                        {d.department && ` — ${d.department}`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              <Button
                                size="sm"
                                className="w-full"
                                disabled={!reassignTo || reassigning}
                                onClick={handleReassign}
                              >
                                {reassigning ? <Spinner size="sm" /> : 'Confirm Reassign'}
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                <p className="text-xs text-ink-faint text-right mt-2">Auto-refreshes every 30 s</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Doctors Tab */}
        <TabsContent value="doctors">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Doctors ({doctors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <Input
                  placeholder="Search doctors..."
                  className="pl-9"
                  value={searchDoctor}
                  onChange={e => setSearchDoctor(e.target.value)}
                />
              </div>
              {loading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : filteredDoctors.length === 0 ? (
                <p className="text-center text-ink-muted py-8">No doctors found</p>
              ) : (() => {
                const grouped: Record<string, Doctor[]> = {}
                filteredDoctors.forEach(d => {
                  const dept = d.department ?? 'Unassigned'
                  if (!grouped[dept]) grouped[dept] = []
                  grouped[dept].push(d)
                })
                const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
                  if (a === 'Unassigned') return 1
                  if (b === 'Unassigned') return -1
                  return a.localeCompare(b)
                })
                return (
                  <div className="space-y-6">
                    {sortedEntries.map(([dept, deptDoctors]) => (
                      <div key={dept}>
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="h-4 w-4 text-accent" />
                          <h3 className="text-sm font-semibold text-gray-700">{dept}</h3>
                          <span className="text-xs text-ink-muted bg-canvas-subtle rounded-full px-2 py-0.5">
                            {deptDoctors.length} doctor{deptDoctors.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {deptDoctors.map(d => {
                            const available = isAvailableNow(d)
                            const today = DAYS[new Date().getDay()]
                            const todayHours = d.workingHours?.find(h => h.day === today)
                            return (
                              <div key={d._id} className="rounded-xl border border-line-subtle bg-canvas-subtle p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      Dr. {d.firstName} {d.lastName}
                                    </p>
                                    <p className="text-xs text-ink-muted truncate">{d.email}</p>
                                    {d.department && (
                                      <p className="text-xs text-accent truncate">{d.department}</p>
                                    )}
                                  </div>
                                  <Badge variant={d.isVerified ? 'success' : 'secondary'} className="shrink-0 text-xs">
                                    {d.isVerified ? 'Verified' : 'Pending'}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <AvailabilityDot doctor={d} />
                                    <span className={available ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                      {!d.workingHours?.length
                                        ? 'No schedule (available)'
                                        : available
                                        ? 'Available now'
                                        : todayHours
                                        ? `Today ${todayHours.start}–${todayHours.end}`
                                        : 'Off today'}
                                    </span>
                                  </div>
                                  {d.phoneNumber && (
                                    <span className="text-ink-muted">{d.phoneNumber}</span>
                                  )}
                                </div>
                                {d.workingHours?.length ? (
                                  <div className="flex flex-wrap gap-1">
                                    {d.workingHours.map(h => (
                                      <span
                                        key={h.day}
                                        className={`text-xs rounded px-1.5 py-0.5 ${
                                          h.day === today && available
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-50 text-blue-600'
                                        }`}
                                      >
                                        {h.day.slice(0, 3)} {h.start}–{h.end}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
