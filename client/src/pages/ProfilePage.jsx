import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import AnimatedButton from '../components/ui/AnimatedButton';
import { api } from '../services/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileVolunteer, setProfileVolunteer] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', pincode: '', skills: '' });
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?._id) return;

    Promise.all([api.get(`/volunteers/${user._id}`), api.get('/activity')])
      .then(([profileRes, activityRes]) => {
        const profile = profileRes.data || null;
        setProfileVolunteer(profile);
        setForm({
          name: profile?.name || '',
          location: profile?.location || '',
          pincode: profile?.pincode || '',
          skills: Array.isArray(profile?.skills) ? profile.skills.join(', ') : '',
        });
        const series = (activityRes.data || []).slice(0, 8).reverse().map((item, index) => ({
          name: `A${index + 1}`,
          hours: item.hoursContributed || 0,
        }));
        setTimeline(series);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load profile data.'));
  }, [user?._id]);

  const handleSaveProfile = () => {
    if (!user?._id) return;

    setSaving(true);
    api
      .put(`/volunteers/${user._id}`, {
        name: form.name.trim(),
        location: form.location.trim(),
        pincode: form.pincode.trim(),
        skills: form.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      })
      .then((res) => {
        setProfileVolunteer(res.data || profileVolunteer);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to update profile.'))
      .finally(() => setSaving(false));
  };

  return (
    <section>
      <PageHeader
        title="Profile"
        subtitle="Volunteer profile, impact summary, and contribution timeline"
      />
      {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="glass rounded-xl p-5">
          <h3 className="mb-3 font-['Outfit'] text-lg font-semibold">Volunteer Profile</h3>
          <div className="mb-3 flex items-center gap-3">
            <img
              src={profileVolunteer?.profileImage || 'https://api.dicebear.com/9.x/initials/svg?seed=volunteer'}
              alt="Profile"
              className="h-14 w-14 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{profileVolunteer?.name || user?.fullName || user?.name || 'Volunteer'}</p>
              <p className="text-sm text-[var(--text-secondary)]">{profileVolunteer?.email || user?.email || 'N/A'}</p>
            </div>
          </div>

          <p className="text-sm text-[var(--text-secondary)]">Role: {profileVolunteer?.role || user?.role || 'volunteer'}</p>
          <p className="text-sm text-[var(--text-secondary)]">Status: {profileVolunteer?.status || 'pending'}</p>
          <p className="text-sm text-[var(--text-secondary)]">Duty: {profileVolunteer?.dutyStatus || 'off-duty'}</p>
          <p className="text-sm text-[var(--text-secondary)]">Location: {profileVolunteer?.location || 'N/A'} ({profileVolunteer?.pincode || 'No Pincode'})</p>
          <p className="text-sm text-[var(--text-secondary)]">Skills: {(profileVolunteer?.skills || []).join(', ') || 'N/A'}</p>
          <p className="text-sm text-[var(--text-secondary)]">Volunteer hours: {profileVolunteer?.hoursContributed || 0}</p>
          <p className="text-sm text-[var(--text-secondary)]">Events participated: {profileVolunteer?.eventsJoined || 0}</p>

          <div className="mt-4 space-y-2">
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none"
              placeholder="Name"
            />
            <input
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none"
              placeholder="Location"
            />
            <input
              value={form.pincode}
              onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none"
              placeholder="Pincode"
            />
            <textarea
              value={form.skills}
              onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))}
              className="min-h-20 w-full rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none"
              placeholder="Skills (comma separated)"
            />
            <AnimatedButton onClick={handleSaveProfile} disabled={saving || !form.name.trim()}>
              {saving ? 'Saving...' : 'Save Profile'}
            </AnimatedButton>
          </div>
        </article>

        <article className="glass rounded-xl p-5">
          <h3 className="mb-3 font-['Outfit'] text-lg font-semibold">Achievement Snapshot</h3>
          <p className="text-sm text-[var(--text-secondary)]">Impact Score: {profileVolunteer?.impactScore || 0}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Availability: {profileVolunteer?.availability ? 'Available' : 'Unavailable'}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(profileVolunteer?.achievements || []).map((item, index) => (
              <span key={`${item.title}-${index}`} className="rounded-full bg-blue-500/20 px-3 py-1 text-xs">
                {item.title}
              </span>
            ))}
            {!profileVolunteer?.achievements?.length ? (
              <span className="rounded-full bg-slate-500/20 px-3 py-1 text-xs text-[var(--text-secondary)]">
                No achievements yet
              </span>
            ) : null}
          </div>
        </article>
      </div>

      <article className="glass mt-4 rounded-2xl p-4">
        <h3 className="mb-3 font-['Outfit'] text-lg font-semibold">Activity Timeline</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.22)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--border-muted)',
                  backgroundColor: 'var(--bg-elevated)',
                }}
              />
              <Area type="monotone" dataKey="hours" stroke="var(--primary)" fill="url(#activityFill)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
};

export default ProfilePage;

