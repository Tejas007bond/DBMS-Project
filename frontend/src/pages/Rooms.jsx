import { rooms, roomsB, patients, patientC, patientB } from '../data/mockData'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'

export default function Rooms() {
  const roomsWithDetails = rooms.map(room => {
    const roomB = roomsB.find(rb => rb.Capacity === room.Capacity)
    const patientCEntry = patientC.find(pc => pc.Room_no === room.Room_no)
    const patientBEntry = patientCEntry
      ? patientB.find(pb => pb.Address === patientCEntry.Address)
      : null
    const patient = patientBEntry
      ? patients.find(p => p.Phone === patientBEntry.Phone)
      : null

    return {
      ...room,
      Availability: roomB?.Availability || 'Unknown',
      Patient: patient ? `${patient.F_name} ${patient.L_name}` : null,
    }
  })

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader title="Rooms" subtitle="View all rooms, their capacity and availability" />
      <div className="p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Rooms</p>
            <p className="text-2xl font-bold text-slate-800">{rooms.length}</p>
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
