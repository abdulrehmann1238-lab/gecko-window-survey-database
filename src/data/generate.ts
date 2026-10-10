import { Customer, Pane, Room, Property, Window, PaneVersion } from './types';
import { createFeaturedCustomers } from './seed/featuredCustomers';
import { resolvePrice } from '../lib/pricing';

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateAllCustomersAndPanes(): {
  customers: Customer[];
  allPanes: Pane[];
} {
  const featured = createFeaturedCustomers();
  const rng = mulberry32(1782026);

  const surnames = [
    'Ashworth', 'Bramley', 'Chetwynd', 'Dunscombe', 'Evelyn', 'Fitzgerald',
    'Gainsborough', 'Harcourt', 'Ingram', 'Kingscote', 'Lechmere', 'Montacute',
    'Northumberland', 'Oatley', 'Ponsonby', 'Quilter', 'Ramsay', 'Stanhope',
    'Talbot', 'Upton', 'Vane', 'Wentworth', 'Yarborough', 'Zouche',
    'Appleton', 'Beckford', 'Claverton', 'Dodington', 'Elland', 'Farleigh',
  ];

  const towns = ['Bath', 'Bristol', 'Corsham', 'Frome', 'Chippenham', 'Cheltenham', 'Wells', 'Salisbury', 'Cirencester', 'Tetbury'];
  const roomsPool = ['Drawing Room', 'Dining Room', 'Library', 'Morning Room', 'Master Bedroom', 'Study', 'Hallway', 'South Parlour'];
  const coloursPool = [
    'White (RAL 9016)', 'White (RAL 9016)', 'Heritage Cream (RAL 9001)',
    'Anthracite (RAL 7016)', 'Black (RAL 9005)', 'Bespoke match'
  ];
  const furniturePool = ['Lift-out', 'Lift-out', 'Fixed', 'Hinged', 'Sliding (Horizontal)', 'Handle and lock'];

  const generatedCustomers: Customer[] = [];
  const targetTotalPanes = 4812;

  // Count existing panes in featured
  let currentTotalPanes = featured.reduce(
    (acc, c) => acc + c.properties.reduce(
      (pacc, p) => pacc + p.rooms.reduce(
        (racc, r) => racc + r.windows.reduce(
          (wacc, w) => wacc + w.panes.length, 0), 0), 0), 0
  );

  const neededPanes = targetTotalPanes - currentTotalPanes;
  const numGeneratedCustomers = 600;
  const avgPanesPerCust = Math.floor(neededPanes / numGeneratedCustomers);

  let remainingToDistribute = neededPanes;

  for (let cIdx = 0; cIdx < numGeneratedCustomers; cIdx++) {
    const custId = `cust_gen_${cIdx + 1}`;
    const sName = surnames[Math.floor(rng() * surnames.length)];
    const town = towns[Math.floor(rng() * towns.length)];
    const custName = `${cIdx % 2 === 0 ? 'Lord' : 'Sir'} ${sName} & Family`;
    const hsNum = 5000000 + Math.floor(rng() * 4000000);

    const propId = `prop_gen_${cIdx + 1}`;
    const propName = `${10 + (cIdx % 80)} ${sName} Crescent`;
    const postcode = `BA${(cIdx % 12) + 1} ${cIdx % 9}QX`;

    // Determine how many panes for this customer
    const panesForThisCust = cIdx === numGeneratedCustomers - 1
      ? remainingToDistribute
      : Math.min(remainingToDistribute, Math.max(2, Math.floor(rng() * (avgPanesPerCust * 2 - 2)) + 2));

    remainingToDistribute -= panesForThisCust;

    // Build rooms & windows
    const roomsCount = Math.min(panesForThisCust, Math.max(1, Math.floor(rng() * 4) + 1));
    const customerRooms: Room[] = [];
    let panesAssigned = 0;

    for (let rIdx = 0; rIdx < roomsCount; rIdx++) {
      const roomId = `room_gen_${cIdx}_${rIdx}`;
      const rName = roomsPool[rIdx % roomsPool.length];
      const winCount = 1;
      const roomWindows: Window[] = [];

      for (let wIdx = 0; wIdx < winCount; wIdx++) {
        const winId = `win_gen_${cIdx}_${rIdx}_${wIdx}`;
        const winPanesCount = rIdx === roomsCount - 1
          ? (panesForThisCust - panesAssigned)
          : Math.max(1, Math.floor((panesForThisCust - panesAssigned) / (roomsCount - rIdx)));
        
        panesAssigned += winPanesCount;

        const windowPanes: Pane[] = [];
        for (let pIdx = 0; pIdx < winPanesCount; pIdx++) {
          const pIndex = pIdx + 1;
          const paneDisplayId = `w${wIdx + 1}p${pIndex}`;
          const pId = `pane_gen_${cIdx}_${rIdx}_${wIdx}_p${pIndex}`;

          const isArched = rng() < 0.12;
          const isAngled = !isArched && rng() < 0.08;
          const shape = isArched ? 'Arched' : isAngled ? 'Angled' : 'Rectangle';
          const isFrosted = rng() < 0.15;
          const isMuseum = rng() < 0.10;
          const tags: string[] = ['3mm'];
          if (isFrosted) tags.push('Frosted');
          if (isMuseum) tags.push('Museum Grade');
          if (isArched) tags.push('Arched');
          if (isAngled) tags.push('Angled');

          const colour = coloursPool[Math.floor(rng() * coloursPool.length)];
          const furniture = furniturePool[Math.floor(rng() * furniturePool.length)];
          const width = 600 + Math.floor(rng() * 1200);
          const height = 900 + Math.floor(rng() * 1500);

          const rPrice = resolvePrice({
            width,
            height,
            shape,
            colour,
            furniture,
            tags,
          });

          const hasV2 = rng() < 0.08;
          const versions: PaneVersion[] = [
            {
              versionNumber: paneDisplayId,
              surveyedDate: '2026-03-01',
              surveyor: 'Daniel Okafor',
              width: hasV2 ? width - 3 : width,
              height: hasV2 ? height - 2 : height,
            },
          ];
          if (hasV2) {
            versions.unshift({
              versionNumber: `${paneDisplayId}-2`,
              surveyedDate: '2026-03-15',
              surveyor: 'Daniel Okafor',
              width,
              height,
              deltaMm: 3,
              reason: 'Re-survey adjustments',
            });
          }

          windowPanes.push({
            id: pId,
            displayId: paneDisplayId,
            customerId: custId,
            propertyId: propId,
            roomId,
            roomName: rName,
            windowId: winId,
            windowLabel: `W${wIdx + 1}`,
            paneIndex: pIndex,
            width,
            height,
            shape,
            colour,
            furniture,
            tags,
            product: 'Gecko Pane',
            currentVersion: hasV2 ? `${paneDisplayId}-2` : paneDisplayId,
            versions,
            rulePrice: rPrice,
            orderedOrderNumbers: [],
          });
        }

        roomWindows.push({
          id: winId,
          roomId,
          label: `W${wIdx + 1}`,
          panes: windowPanes,
        });
      }

      customerRooms.push({
        id: roomId,
        propertyId: propId,
        name: rName,
        windows: roomWindows,
      });
    }

    const surveyVal = customerRooms.reduce(
      (acc, r) => acc + r.windows.reduce(
        (wacc, w) => wacc + w.panes.reduce((pacc, p) => pacc + p.rulePrice, 0), 0), 0
    );

    const hasOrdered = rng() < 0.35;
    const orderedVal = hasOrdered ? Math.round(surveyVal * (0.4 + rng() * 0.6)) : 0;

    generatedCustomers.push({
      id: custId,
      name: custName,
      company: `${sName} Holdings`,
      hubspotId: `HS-${hsNum}`,
      email: `office@${sName.toLowerCase()}-estate.co.uk`,
      phone: `01225 ${300000 + cIdx}`,
      address: `${propName}, ${town}`,
      postcode,
      surveyValueExVat: Math.round(surveyVal * 100) / 100,
      orderedValueExVat: Math.round(orderedVal * 100) / 100,
      lastActivity: '2026-10-05T12:00:00Z',
      hasOpenQuote: rng() < 0.25,
      properties: [
        {
          id: propId,
          customerId: custId,
          name: propName,
          addressLine1: propName,
          city: town,
          postcode,
          rooms: customerRooms,
        },
      ],
    });
  }

  const allCustomers = [...featured, ...generatedCustomers];

  // Flatten all panes across all customers
  const allPanes: Pane[] = [];
  allCustomers.forEach(cust => {
    cust.properties.forEach(prop => {
      prop.rooms.forEach(room => {
        room.windows.forEach(win => {
          win.panes.forEach(pane => {
            allPanes.push(pane);
          });
        });
      });
    });
  });

  return { customers: allCustomers, allPanes };
}
