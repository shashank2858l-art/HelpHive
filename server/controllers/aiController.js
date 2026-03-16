import { TABLES } from '../models/tableNames.js';
import { listRows } from '../services/dataService.js';
import { buildAiInsight } from '../services/groqService.js';

export const recommendVolunteers = async (_req, res) => {
  const volunteers = await listRows(TABLES.volunteers);
  const recommendations = [...volunteers]
    .sort((a, b) => Number(b.impactScore || 0) - Number(a.impactScore || 0))
    .slice(0, 5)
    .map((volunteer) => ({
      _id: volunteer.id,
      name: volunteer.name,
      skills: volunteer.skills || [],
      location: (volunteer.location || '').split('||')[0] || 'Unknown',
      score: Number(volunteer.impactScore || 0),
    }));

  return res.json({ recommendations });
};

export const chatbot = async (req, res) => {
  const message = req.body?.message || 'Give NGO coordination advice.';
  const reply = await buildAiInsight(message);
  return res.json({ reply });
};

export const volunteerInsights = async (_req, res) => {
  const [events, disasters] = await Promise.all([
    listRows(TABLES.events),
    listRows(TABLES.disasters),
  ]);

  const insight = await buildAiInsight(
    `We have ${events.length} events and ${disasters.length} active disaster alerts. Suggest volunteer allocations.`
  );

  return res.json({
    success: true,
    insight,
    fallbackRecommendations: [
      'Assign medical volunteers to critical requests first.',
      'Deploy logistics volunteers near resource bottlenecks.',
      'Increase on-duty coverage around active event locations.',
    ],
    suggestedEvents: events.slice(0, 3),
    bestVolunteerRoles: ['Medical Support', 'Logistics Coordinator', 'Field Responder'],
    disasterAlerts: disasters.slice(0, 5),
  });
};

export const predictResources = async (req, res) => {
  const { eventType, expectedVolunteers = 0 } = req.body || {};
  const volunteers = Number(expectedVolunteers || 0);

  const predicted = {
    medicalKits: Math.max(5, Math.ceil(volunteers * 0.25)),
    foodPacks: Math.max(10, Math.ceil(volunteers * 0.8)),
    waterUnits: Math.max(12, Math.ceil(volunteers * 1.2)),
    logisticsCrew: Math.max(2, Math.ceil(volunteers * 0.08)),
  };

  return res.json({
    eventType: eventType || 'general',
    expectedVolunteers: volunteers,
    predicted,
  });
};
