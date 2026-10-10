import { Note } from '../types';

export const seededNotes: Note[] = [
  {
    id: 'note_cal_1',
    customerId: 'cust_calloway',
    propertyId: 'prop_cal_14pelham',
    propertyName: '14 Pelham Crescent',
    author: 'Daniel Okafor',
    date: '2026-03-12T11:00:00Z',
    scope: 'Property',
    text: 'Client requested Anthracite finish specifically for the Drawing Room front facade to match the iron railings outside. Reveal plaster in Drawing Room W1 has slight 3mm taper towards the top right sill.',
    amendment: {
      author: 'Daniel Okafor',
      date: '2026-03-12T14:30:00Z',
      text: 'Verified reveal taper against laser level. Pane w1p3 dimension updated to 1,184 × 862 mm.',
    },
  },
  {
    id: 'note_cal_2',
    customerId: 'cust_calloway',
    author: 'Priya Raman',
    date: '2026-10-09T14:05:00Z',
    scope: 'Customer',
    text: 'Spoke with Eleanor Calloway by telephone. She prefers clear glazing rather than frosted privacy panels in the drawing room so garden light remains unobstructed.',
  },
  {
    id: 'note_sta_1',
    customerId: 'cust_staldhelms',
    propertyId: 'prop_sta_church',
    propertyName: "St Aldhelm's Church",
    author: 'Marcus Doyle',
    date: '2026-10-06T16:20:00Z',
    scope: 'Property',
    text: 'Diocesan Advisory Committee (DAC) faculty approval granted for internal lift-out secondary glazing on condition that no frames fix into stonework mullions.',
  },
];
