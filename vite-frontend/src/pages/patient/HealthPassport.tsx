import React, { useEffect, useState } from 'react'
import {
  User, Droplets, Calendar, Phone, MapPin, Heart, Pill, Scissors,
  Building2, AlertTriangle, CreditCard, FileText, Clock, Stethoscope,
  ChevronDown, ChevronUp, Layers, Mail,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { DDITable } from '@/components/ddi/DDITable'
import type { Patient, MedicalRecord, Hospital, Doctor, Medication } from '@/types'
import client from '@/api/client'

export default function HealthPassport() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [expandedHospital, setExpandedHospital] = useState<string | null>(null)
  const [hospitalDoctors, setHospitalDoctors] = useState<
    Record<string, { doctors: Doctor[]; loading: boolean; loaded: boolean }>
  >({})

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [profileRes, recordsRes, hospitalsRes] = await Promise.all([
          client.get('/auth/me'),
          client.get('/medical-record'),
          client.get('/hospital'),
        ])

        const d = profileRes.data
        const patientData: Patient = d.data ?? d
        setPatient(patientData)

        const r = recordsRes.data
        setRecords(Array.isArray(r) ? r : r.data ?? [])

        const h = hospitalsRes.data
        setHospitals(Array.isArray(h) ? h : h.data ?? [])
      } catch {
        setError('Failed to load health passport data')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const toggleHospitalStaff = async (hospitalId: string) => {
    if (expandedHospital === hospitalId) { setExpandedHospital(null); return }
    setExpandedHospital(hospitalId)
    if (hospitalDoctors[hospitalId]?.loaded) return
    setHospitalDoctors(prev => ({ ...prev, [hospitalId]: { doctors: [], loading: true, loaded: false } }))
    try {
      const res = await client.get(`/hospital/${hospitalId}`)
      const doctors: Doctor[] = res.data?.data?.doctors ?? res.data?.doctors ?? []
      setHospitalDoctors(prev => ({ ...prev, [hospitalId]: { doctors, loading: false, loaded: true } }))
    } catch {
      setHospitalDoctors(prev => ({ ...prev, [hospitalId]: { doctors: [], loading: false, loaded: true } }))
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Spinner size="lg" />
    </div>
  )
  if (error) return (
    <div className="flex items-center gap-2 rounded-md bg-danger-light border border-sev-critical-line px-4 py-3 text-sm text-danger">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />{error}
    </div>
  )
  if (!patient) return (
    <p className="text-sm text-ink-secondary">No patient data found.</p>
  )

  const getDoctor   = (doc: Doctor | string)  => typeof doc === 'string' ? null : doc
  const getHospital = (h: Hospital | string)  => typeof h   === 'string' ? null : h

  const allMedications: (Medication & { recordDate: string; doctor: Doctor | null; hospital: Hospital | null })[] =
    records.flatMap(r =>
      r.medications.map(m => ({
        ...m,
        recordDate: r.createdAt,
        doctor: getDoctor(r.doctorId as Doctor | string),
        hospital: getHospital(r.hospitalId as Hospital | string),
      }))
    )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Identity card — accent gradient */}
      <div
        className="rounded-xl px-7 py-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, oklch(64% 0.24 232) 0%, oklch(54% 0.25 218) 48%, oklch(46% 0.22 207) 100%)' }}
      >
        {/* Subtle glow blobs */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white opacity-[0.06] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white opacity-[0.05] blur-2xl" />
        <div className="flex items-center gap-2 mb-5 relative">
          <CreditCard className="h-3.5 w-3.5 text-white/55" />
          <span className="text-2xs font-medium tracking-widest uppercase text-white/55">
            NFC Health Passport
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white/18 border border-white/25 relative">
            <User className="h-8 w-8 text-white/75" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1 tracking-tight">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-sm text-white font-medium mb-5">ID: {patient.nationalId}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <IdentityChip
                icon={<Droplets className="h-3.5 w-3.5" />}
                label="Blood type"
                value={patient.bloodType ?? 'Unknown'}
                accent
              />
              <IdentityChip
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Date of birth"
                value={new Date(patient.dateOfBirth).toLocaleDateString()}
              />
              <IdentityChip
                icon={<User className="h-3.5 w-3.5" />}
                label="Gender"
                value={patient.gender}
              />
              {patient.phoneNumber && (
                <IdentityChip
                  icon={<Phone className="h-3.5 w-3.5" />}
                  label="Phone"
                  value={patient.phoneNumber}
                />
              )}
              {patient.email && (
                <IdentityChip
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label="Email"
                  value={patient.email}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal details row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-1.5 text-2xs font-medium text-ink-muted uppercase tracking-wider mb-2">
              <MapPin className="h-3 w-3" />Address
            </div>
            {patient.address
              ? <p className="text-sm text-ink">{patient.address}</p>
              : <p className="text-sm text-ink-faint italic">Not provided</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-1.5 text-2xs font-medium text-ink-muted uppercase tracking-wider mb-2">
              <CreditCard className="h-3 w-3" />NFC card ID
            </div>
            {patient.cardId
              ? <p className="text-sm text-ink font-mono break-all">{patient.cardId}</p>
              : <p className="text-sm text-ink-faint italic">No card linked</p>}
          </CardContent>
        </Card>

        <Card className={patient.emergencyContact ? 'border-sev-critical-line' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-1.5 text-2xs font-medium text-sev-critical-fg uppercase tracking-wider mb-2">
              <AlertTriangle className="h-3 w-3" />Emergency contact
            </div>
            {patient.emergencyContact ? (
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-ink">{patient.emergencyContact.name}</p>
                <p className="text-xs text-ink-secondary">{patient.emergencyContact.relation}</p>
                <p className="text-xs text-ink-secondary flex items-center gap-1 mt-1">
                  <Phone className="h-3 w-3" />{patient.emergencyContact.phone}
                </p>
              </div>
            ) : (
              <p className="text-sm text-ink-faint italic">Not provided</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history">
        <TabsList className="w-full sm:w-auto flex-wrap h-auto">
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="surgeries">Surgeries</TabsTrigger>
          <TabsTrigger value="ddi">DDI Reports</TabsTrigger>
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
        </TabsList>

        {/* Medical History */}
        <TabsContent value="history">
          {records.length === 0 ? (
            <EmptyState icon={<FileText className="h-8 w-8 text-ink-faint" />} label="No medical records on file" />
          ) : (
            <div className="space-y-4">
              {records.map(record => {
                const doc  = getDoctor(record.doctorId as Doctor | string)
                const hosp = getHospital(record.hospitalId as Hospital | string)
                return (
                  <Card key={record._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light flex-shrink-0">
                            <Heart className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <CardTitle>{record.diagnosis}</CardTitle>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {doc && (
                                <span className="text-xs text-ink-secondary">
                                  Dr. {doc.firstName} {doc.lastName}
                                  {doc.department && ` · ${doc.department}`}
                                </span>
                              )}
                              {hosp && (
                                <span className="text-xs text-ink-muted">· {hosp.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-ink-muted flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {record.treatment && (
                        <p className="text-sm text-ink mb-3">
                          <span className="font-medium">Treatment:</span>{' '}
                          <span className="text-ink-secondary">{record.treatment}</span>
                        </p>
                      )}
                      {record.medications.length > 0 && (
                        <div>
                          <p className="text-2xs font-semibold text-ink-muted uppercase tracking-wider mb-2">Medications</p>
                          <div className="flex flex-wrap gap-2">
                            {record.medications.map((med, i) => (
                              <span key={i} className="inline-flex items-center gap-1 bg-accent-light text-accent rounded-full px-3 py-1 text-xs font-medium">
                                <Pill className="h-3 w-3" />
                                {med.name} {med.dosage || med.dose || ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Medications */}
        <TabsContent value="medications">
          {allMedications.length === 0 ? (
            <EmptyState icon={<Pill className="h-8 w-8 text-ink-faint" />} label="No medications on record" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allMedications.map((med, i) => (
                <Card key={`${med.name}_${i}`}>
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent-light">
                        <Pill className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink truncate">{med.name}</p>
                        <p className="text-sm text-ink-secondary">{med.dosage || med.dose || ''}</p>
                        {med.duration && <p className="text-xs text-ink-muted mt-1">Duration: {med.duration}</p>}
                        {med.notes && <p className="text-xs text-ink-muted mt-1">{med.notes}</p>}
                        <div className="mt-2.5 space-y-1">
                          {med.doctor && (
                            <p className="text-xs text-accent flex items-center gap-1">
                              <Stethoscope className="h-3 w-3 flex-shrink-0" />
                              Dr. {med.doctor.firstName} {med.doctor.lastName}
                              {med.doctor.department && ` · ${med.doctor.department}`}
                            </p>
                          )}
                          {med.hospital && (
                            <p className="text-xs text-ink-secondary flex items-center gap-1">
                              <Building2 className="h-3 w-3 flex-shrink-0" />
                              {med.hospital.name}
                            </p>
                          )}
                          <p className="text-xs text-ink-faint flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {new Date(med.recordDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Surgeries */}
        <TabsContent value="surgeries">
          {!patient.surgerys || patient.surgerys.length === 0 ? (
            <EmptyState icon={<Scissors className="h-8 w-8 text-ink-faint" />} label="No surgical history" />
          ) : (
            <Card>
              <CardContent className="pt-5">
                <ul className="space-y-3">
                  {patient.surgerys.map((surgery, i) => (
                    <li key={`${surgery}_${i}`} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sev-high-bg">
                        <Scissors className="h-3.5 w-3.5 text-sev-high-fg" />
                      </div>
                      <span className="text-sm text-ink">{surgery}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {patient.ChronicDiseases && patient.ChronicDiseases.length > 0 && (
            <Card className="mt-4">
              <CardHeader><CardTitle>Chronic conditions</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {patient.ChronicDiseases.map((d, i) => (
                    <span key={`${d}_${i}`} className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-sev-critical-bg text-sev-critical-fg border border-sev-critical-line">
                      {d}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* DDI Reports */}
        <TabsContent value="ddi">
          <DDITable patientId={patient._id} />
        </TabsContent>

        {/* Hospitals */}
        <TabsContent value="hospitals">
          {hospitals.length === 0 ? (
            <EmptyState icon={<Building2 className="h-8 w-8 text-ink-faint" />} label="No hospitals found" />
          ) : (
            <div className="space-y-4">
              {hospitals.map(h => {
                const isExpanded = expandedHospital === h._id
                const staffState = hospitalDoctors[h._id]
                const grouped: Record<string, Doctor[]> = {}
                for (const doc of staffState?.doctors ?? []) {
                  const dept = doc.department || 'General'
                  ;(grouped[dept] ??= []).push(doc)
                }
                return (
                  <Card key={h._id} className={isExpanded ? 'border-accent-muted' : ''}>
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent-light">
                          <Building2 className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-ink capitalize">{h.name}</p>
                          <div className="flex items-center gap-1 text-xs text-ink-secondary mt-1">
                            <MapPin className="h-3 w-3" />{h.address}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-ink-secondary mt-1">
                            <Phone className="h-3 w-3" />{h.phoneNumber}
                          </div>
                          {h.hotline && (
                            <div className="text-xs text-sev-critical-fg mt-1 font-medium">
                              Emergency: {h.hotline}
                            </div>
                          )}
                          {h.departments && h.departments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {h.departments.map((d, i) => (
                                <span key={i} className="inline-flex items-center gap-1 bg-accent-light text-accent rounded-full px-2.5 py-0.5 text-xs">
                                  <Layers className="h-3 w-3" />{d.name}{d.floor ? ` · Floor ${d.floor}` : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => toggleHospitalStaff(h._id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover flex-shrink-0 mt-0.5 px-3 py-1.5 rounded-md hover:bg-accent-light transition-colors"
                        >
                          <Stethoscope className="h-3.5 w-3.5" />
                          {isExpanded ? 'Hide staff' : 'View staff'}
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 border-t border-line pt-4">
                          {staffState?.loading ? (
                            <div className="flex justify-center py-6"><Spinner size="sm" /></div>
                          ) : !staffState?.doctors.length ? (
                            <p className="text-sm text-ink-muted text-center py-4">No doctors registered at this hospital</p>
                          ) : (
                            <div className="space-y-4">
                              {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([dept, docs]) => (
                                <div key={dept}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xs font-semibold text-accent uppercase tracking-wider">{dept}</span>
                                    <span className="text-2xs text-ink-muted">({docs.length})</span>
                                  </div>
                                  <div className="grid sm:grid-cols-2 gap-2">
                                    {docs.map(doc => (
                                      <div key={doc._id} className="rounded-lg bg-canvas-subtle border border-line-subtle px-3 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent-light">
                                            <User className="h-3.5 w-3.5 text-accent" />
                                          </div>
                                          <p className="text-sm font-medium text-ink truncate">
                                            Dr. {doc.firstName} {doc.lastName}
                                          </p>
                                        </div>
                                        {doc.workingHours && doc.workingHours.length > 0 && (
                                          <div className="mt-2 ml-9 space-y-0.5">
                                            {doc.workingHours.map((wh, idx) => (
                                              <div key={idx} className="flex items-center gap-1.5 text-xs text-ink-secondary">
                                                <Clock className="h-3 w-3 text-ink-muted flex-shrink-0" />
                                                <span className="font-medium w-24">{wh.day}</span>
                                                <span>{to12h(wh.start)} – {to12h(wh.end)}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function to12h(time: string) {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function IdentityChip({ icon, label, value, accent }: {
  icon: React.ReactNode
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-white/55 text-2xs mb-1">{icon}{label}</div>
      <p className={`font-semibold ${accent ? 'text-lg text-white' : 'text-sm text-white'}`}>{value}</p>
    </div>
  )
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon}
      <p className="mt-3 text-sm text-ink-secondary">{label}</p>
    </div>
  )
}
