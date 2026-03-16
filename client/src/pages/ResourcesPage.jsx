import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import AnimatedButton from '../components/ui/AnimatedButton';
import { StaggerSection } from '../components/ui/StaggerSection';
import CsvUploader from '../components/common/CsvUploader';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const statusClass = {
  available: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/35',
  low: 'bg-amber-500/20 text-amber-200 border border-amber-400/35',
  critical: 'bg-rose-500/20 text-rose-200 border border-rose-400/35',
  depleted: 'bg-rose-500/20 text-rose-200 border border-rose-400/35',
};

const ResourcesPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [form, setForm] = useState({
    resourceName: '',
    quantity: 0,
    location: '',
    status: 'available',
  });

  const loadResources = () => {
    api
      .get('/resources')
      .then((res) => setResources(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load resources.'));
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleCreate = () => {
    setSaving(true);
    api
      .post('/resources', {
        resourceName: form.resourceName,
        quantity: Number(form.quantity) || 0,
        location: form.location,
        status: form.status,
      })
      .then(() => {
        setForm({ resourceName: '', quantity: 0, location: '', status: 'available' });
        loadResources();
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to create resource.'))
      .finally(() => setSaving(false));
  };

  const handleUpdateStatus = (resource) => {
    const order = ['available', 'low', 'critical'];
    const current = String(resource.status || 'available').toLowerCase();
    const next = order[(order.indexOf(current) + 1) % order.length];

    api
      .put(`/resources/${resource._id}`, { status: next })
      .then((res) => {
        setResources((prev) => prev.map((item) => (item._id === resource._id ? res.data : item)));
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to update resource.'));
  };

  const handleDelete = (id) => {
    api
      .delete(`/resources/${id}`)
      .then(() => setResources((prev) => prev.filter((item) => item._id !== id)))
      .catch((err) => setError(err.response?.data?.message || 'Unable to delete resource.'));
  };

  const handleBulkUpload = (data) => {
    setSaving(true);
    api
      .post('/resources/bulk', { data })
      .then(() => {
        setIsUploadingCsv(false);
        loadResources();
      })
      .catch((err) => setError(err.response?.data?.message || 'Bulk upload failed.'))
      .finally(() => setSaving(false));
  };

  return (
    <section className="space-y-5 pb-10 md:space-y-6">
      <PageHeader
        title="Resources"
        subtitle="Inventory control with stock health monitoring across all NGO hubs"
        action={
          user?.role === 'admin' ? (
            <button
              onClick={() => setIsUploadingCsv(true)}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--surface-hover)]"
            >
              <FileUp className="h-4 w-4" />
              Upload CSV
            </button>
          ) : null
        }
      />
      {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}

      {user?.role === 'admin' ? (
        <StaggerSection className="glass rounded-xl p-4">
          <h3 className="mb-3 font-['Outfit'] text-lg font-semibold">Add Resource</h3>
          <div className="grid gap-2 md:grid-cols-5">
            <input
              value={form.resourceName}
              onChange={(e) => setForm((prev) => ({ ...prev, resourceName: e.target.value }))}
              placeholder="Resource name"
              className="h-11 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 text-sm outline-none"
            />
            <input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm((prev) => ({ ...prev, quantity: Number(e.target.value) || 0 }))}
              placeholder="Quantity"
              className="h-11 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 text-sm outline-none"
            />
            <input
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Location"
              className="h-11 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 text-sm outline-none"
            />
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              className="h-11 rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 text-sm outline-none"
            >
              <option value="available">available</option>
              <option value="low">low</option>
              <option value="critical">critical</option>
            </select>
            <AnimatedButton
              onClick={handleCreate}
              disabled={saving || !form.resourceName || !form.location}
              className="h-11 w-full justify-center"
            >
              {saving ? 'Adding...' : 'Add Resource'}
            </AnimatedButton>
          </div>
        </StaggerSection>
      ) : null}

      <StaggerSection className="glass overflow-x-auto rounded-2xl p-4">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[var(--text-muted)]">
            <tr>
              <th className="pb-2">Resource Name</th>
              <th className="pb-2">Quantity</th>
              <th className="pb-2">Location</th>
              <th className="pb-2">Status</th>
              {user?.role === 'admin' ? <th className="pb-2 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {resources.map((r, index) => (
              <motion.tr
                key={r._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="border-t border-[var(--border-muted)]"
              >
                <td className="py-3">{r.resourceName || r.name}</td>
                <td className="py-3">
                  <div className="w-52">
                    <div className="mb-1 text-xs text-[var(--text-secondary)]">{r.quantity}</div>
                    <div className="h-2 rounded-full bg-slate-700/45">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(r.quantity, 100)}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + index * 0.03 }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3">{r.location}</td>
                <td className="py-3">
                  <span className={`rounded-full px-3 py-1 text-xs ${statusClass[String(r.status || 'available').toLowerCase()] || statusClass.available}`}>{r.status}</span>
                </td>
                {user?.role === 'admin' ? (
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(r)}
                        className="rounded-lg border border-[var(--border-muted)] px-3 py-1.5 text-xs"
                      >
                        Cycle Status
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r._id)}
                        className="rounded-lg border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                ) : null}
              </motion.tr>
            ))}
            {!resources.length ? (
              <tr>
                <td className="py-3 text-sm text-[var(--text-secondary)]" colSpan={user?.role === 'admin' ? 5 : 4}>No resources found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </StaggerSection>

      {isUploadingCsv && (
        <CsvUploader
          title="Upload Resource Inventory"
          onUpload={handleBulkUpload}
          onCancel={() => setIsUploadingCsv(false)}
        />
      )}
    </section>
  );
};

export default ResourcesPage;
