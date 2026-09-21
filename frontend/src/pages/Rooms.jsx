import { useState, useEffect } from 'react'
import { roomsApi, patientsApi } from '../api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'

export default function Rooms() {
  const [roomsWithDetails, setRoomsWithDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRooms()
  }, [])

  async function fetchRooms() {
    try {
      setLoading(true)
      const [roomsData, patientsData] = await Promise.all([
        roomsApi.getAll(),
        patientsApi.getAll()
      ])

      const enrichedRooms = roomsData.map(room => {
        const patient = patientsData.find(p => p.Room_no === room.Room_no)
        return {
          ...room,
          Patient: patient ? `${patient.F_name} ${patient.L_name}` : null,
        }
      })

      setRoomsWithDetails(enrichedRooms)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-slate-500">Loading rooms...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader title="Rooms" subtitle="View all rooms, their capacity and availability" />
      <div className="p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Rooms</p>
            <p className="text-2xl font-bold text-slate-800">{roomsWithDetails.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Available</p>
            <p className="text-2xl font-bold text-emerald-600">
              {roomsWithDetails.filter(r => r.Availability === 'Available').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Full / Maintenance</p>
            <p className="text-2xl font-bold text-amber-600">
              {roomsWithDetails.filter(r => r.Availability !== 'Available').length}
            </p>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomsWithDetails.map(room => (
            <div
              key={room.Room_no}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Room {room.Room_no}</h3>
                  <p className="text-sm text-slate-500">{room.Type}</p>
                </div>
                <StatusBadge
                  status={room.Availability}
                  type={
                    room.Availability === 'Available'
                      ? 'success'
                      : room.Availability === 'Full'
                      ? 'danger'
                      : 'warning'
                  }
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Capacity</span>
                  <span className="font-medium text-slate-700">{room.Capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient</span>
                  <span className="font-medium text-slate-700">
                    {room.Patient || 'Unoccupied'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
