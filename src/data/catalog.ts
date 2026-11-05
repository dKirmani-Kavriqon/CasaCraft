/*
  Casa Craft catalogue.

  Every product image comes from Casa Craft's own Instagram photography, upscaled and cut out.

  REVIEW BEFORE LAUNCH: prices, dimensions and product names are placeholders written for this
  prototype. Replace them with the workshop's real figures. Search for "PLACEHOLDER".
*/
import type { ImageMetadata } from 'astro';

import nishatSaddle from '../assets/products/nishat-saddle.png';
import nishatDal from '../assets/products/nishat-dal.png';
import nishatPair from '../assets/products/nishat-pair.png';
import zabarwan from '../assets/products/zabarwan.png';
import zabarwanCushion from '../assets/products/zabarwan-cushion.jpg';

import scenePair from '../assets/scenes/nishat-pair.jpg';
import sceneZabarwan from '../assets/scenes/zabarwan.jpg';
import detailNishat from '../assets/scenes/nishat-arms.jpg';
import detailZabarwan from '../assets/scenes/zabarwan-frame.jpg';

import swSaddle from '../assets/materials/leather-saddle.jpg';
import swDal from '../assets/materials/leather-dal.jpg';
import swCocoa from '../assets/materials/boucle-cocoa.jpg';
import swWalnut from '../assets/materials/wood-walnut.jpg';
import swEbonised from '../assets/materials/wood-ebonised.jpg';

export const brand = {
  name: 'Casa Craft Interiors',
  short: 'Casa Craft',
  line: 'Handcrafted. Rooted in solid wood.',
  tagline: 'Crafted for comfort, designed for luxury.',
  location: 'Nowgam, Srinagar',
  instagram: 'casa.craft.interiors',
  // Leave empty to hide. Use the international format without "+" or spaces, e.g. "919xxxxxxxxx".
  whatsapp: '',
  email: '',
  currency: 'INR',
} as const;

export const instagramUrl = `https://www.instagram.com/${brand.instagram}/`;
export const instagramDm = `https://ig.me/m/${brand.instagram}`;
export const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Nowgam%2C%20Srinagar';

export type MaterialFamily = 'Leather' | 'Bouclé' | 'Solid wood';
export type Tint = 'saddle' | 'dal' | 'cocoa' | 'neutral';

export interface Material {
  id: string;
  name: string;
  family: MaterialFamily;
  swatch: ImageMetadata;
  hex: string; // flat colour for small dots, sampled from the photographs
  tint: Tint;
  description: string;
  care: string;
}

export const materials: Material[] = [
  {
    id: 'saddle',
    name: 'Saddle',
    family: 'Leather',
    swatch: swSaddle,
    hex: '#c98a55',
    tint: 'saddle',
    description: 'A warm tan leather with a soft sheen that deepens as it is used and loved.',
    care: 'Dust with a dry cloth. Condition twice a year. Keep out of direct sun.',
  },
  {
    id: 'dal',
    name: 'Dal',
    family: 'Leather',
    swatch: swDal,
    hex: '#2c6f82',
    tint: 'dal',
    description: 'A deep lake blue, named for Dal Lake in the late afternoon.',
    care: 'Dust with a dry cloth. Condition twice a year. Keep out of direct sun.',
  },
  {
    id: 'cocoa',
    name: 'Cocoa',
    family: 'Bouclé',
    swatch: swCocoa,
    hex: '#4b3326',
    tint: 'cocoa',
    description: 'A dense looped bouclé in dark cocoa. Soft to the hand, with a deep pile that catches light.',
    care: 'Vacuum gently with a soft brush. Blot spills, never rub.',
  },
  {
    id: 'walnut',
    name: 'Walnut finish',
    family: 'Solid wood',
    swatch: swWalnut,
    hex: '#9a4f22',
    tint: 'saddle',
    description: 'Solid wood finished in a warm walnut tone that shows the grain.',
    care: 'Wipe with a soft, slightly damp cloth. Use coasters and avoid standing water.',
  },
  {
    id: 'ebonised',
    name: 'Ebonised',
    family: 'Solid wood',
    swatch: swEbonised,
    hex: '#1f1b18',
    tint: 'cocoa',
    description: 'Solid wood stained close to black, so the frame reads as a single drawn line.',
    care: 'Wipe with a soft, slightly damp cloth. Use coasters and avoid standing water.',
  },
];

export const materialById = Object.fromEntries(materials.map((m) => [m.id, m])) as Record<string, Material>;

export type CategoryId = 'dining-chairs' | 'lounge-chairs' | 'sets' | 'cushions';

export const categories: { id: CategoryId; name: string; blurb: string }[] = [
  { id: 'dining-chairs', name: 'Dining chairs', blurb: 'Curved backs and tapered legs, made to be sat in for the length of a long meal.' },
  { id: 'lounge-chairs', name: 'Lounge chairs', blurb: 'Low, deep seats on solid frames, for reading corners and slow evenings.' },
  { id: 'sets', name: 'Sets', blurb: 'Pieces paired at the workshop, ready for a room.' },
  { id: 'cushions', name: 'Cushions', blurb: 'Soft pieces in the same cloth as our upholstery.' },
];

export interface Product {
  slug: string;
  name: string;
  variant: string;
  collection: 'Nishat' | 'Zabarwan';
  category: CategoryId;
  price: number; // PLACEHOLDER: INR, replace with real pricing
  upholstery: string; // material id
  alsoUpholstered?: string[]; // further material ids, for sets
  frame?: string; // material id
  tint: Tint;
  image: ImageMetadata; // cut-out product shot, or a photo when imageKind is 'photo'
  imageKind?: 'cutout' | 'photo';
  detail: ImageMetadata;
  room: ImageMetadata;
  summary: string;
  story: string;
  highlights: string[];
  dimensions: { label: string; value: string }[]; // PLACEHOLDER: approximate, replace with workshop measurements
  siblings?: string[]; // same design in another material
  pairsWith: string[];
}

export const products: Product[] = [
  {
    slug: 'nishat-dining-chair-saddle',
    name: 'Nishat Dining Chair',
    variant: 'Saddle leather',
    collection: 'Nishat',
    category: 'dining-chairs',
    price: 38500,
    upholstery: 'saddle',
    frame: 'walnut',
    tint: 'saddle',
    image: nishatSaddle,
    detail: detailNishat,
    room: scenePair,
    summary: 'A curved back that holds you, set in a solid wood shell with tapered legs.',
    story:
      'Named for Nishat Bagh, the terraced garden on the eastern shore of Dal Lake. The back is one continuous curve, wrapped in a solid wood shell, so the chair looks as good from behind as it does at the table.',
    highlights: [
      'Solid wood frame and tapered legs',
      'Deep, curved back with a wrapped wooden shell',
      'Upholstered in Saddle leather',
      'Handcrafted to order in Nowgam, Srinagar',
    ],
    dimensions: [
      { label: 'Width', value: '56 cm' },
      { label: 'Depth', value: '58 cm' },
      { label: 'Height', value: '82 cm' },
      { label: 'Seat height', value: '47 cm' },
    ],
    siblings: ['nishat-dining-chair-dal'],
    pairsWith: ['nishat-pair', 'zabarwan-lumbar-cushion'],
  },
  {
    slug: 'nishat-dining-chair-dal',
    name: 'Nishat Dining Chair',
    variant: 'Dal leather',
    collection: 'Nishat',
    category: 'dining-chairs',
    price: 38500,
    upholstery: 'dal',
    frame: 'walnut',
    tint: 'dal',
    image: nishatDal,
    detail: detailNishat,
    room: scenePair,
    summary: 'The Nishat in a deep lake blue, framed in warm solid wood.',
    story:
      'The same continuous curve as the Saddle, in a blue taken from Dal Lake. The warm wooden shell keeps the colour grounded, so it sits as easily in a quiet dining room as it does in a bright one.',
    highlights: [
      'Solid wood frame and tapered legs',
      'Deep, curved back with a wrapped wooden shell',
      'Upholstered in Dal leather',
      'Handcrafted to order in Nowgam, Srinagar',
    ],
    dimensions: [
      { label: 'Width', value: '56 cm' },
      { label: 'Depth', value: '58 cm' },
      { label: 'Height', value: '82 cm' },
      { label: 'Seat height', value: '47 cm' },
    ],
    siblings: ['nishat-dining-chair-saddle'],
    pairsWith: ['nishat-pair', 'zabarwan-lounge-chair'],
  },
  {
    slug: 'nishat-pair',
    name: 'Nishat Pair',
    variant: 'One Saddle, one Dal',
    collection: 'Nishat',
    category: 'sets',
    price: 74000,
    upholstery: 'saddle',
    alsoUpholstered: ['dal'],
    frame: 'walnut',
    tint: 'neutral',
    image: nishatPair,
    detail: detailNishat,
    room: scenePair,
    summary: 'Two Nishat chairs in two leathers. Warm and cool, made to face each other.',
    story:
      'The Nishat in both of its leathers, as a set: one Saddle, one Dal. Set across a small table or either side of a window, the two colours answer each other while the shared wooden frame ties them together.',
    highlights: [
      'Two chairs: one Saddle leather, one Dal leather',
      'Matched solid wood frames',
      'Priced as a set',
      'Handcrafted to order in Nowgam, Srinagar',
    ],
    dimensions: [
      { label: 'Each chair', value: '56 × 58 × 82 cm' },
      { label: 'Seat height', value: '47 cm' },
      { label: 'Pieces', value: '2' },
    ],
    pairsWith: ['nishat-dining-chair-saddle', 'nishat-dining-chair-dal'],
  },
  {
    slug: 'zabarwan-lounge-chair',
    name: 'Zabarwan Lounge Chair',
    variant: 'Cocoa bouclé, ebonised frame',
    collection: 'Zabarwan',
    category: 'lounge-chairs',
    price: 64000,
    upholstery: 'cocoa',
    frame: 'ebonised',
    tint: 'cocoa',
    image: zabarwan,
    detail: detailZabarwan,
    room: sceneZabarwan,
    summary: 'A low lounge chair on an angular ebonised frame, with a deep bouclé seat.',
    story:
      'Named for the Zabarwan range that rises behind Srinagar. The ebonised frame is drawn in a few long, sloping lines, and the seat is wrapped in a dense cocoa bouclé. Shown with the Zabarwan Lumbar Cushion in the same cloth.',
    highlights: [
      'Solid wood frame in an ebonised finish',
      'Deep seat and reclined back in Cocoa bouclé',
      'Pairs with the Zabarwan Lumbar Cushion',
      'Handcrafted to order in Nowgam, Srinagar',
    ],
    dimensions: [
      { label: 'Width', value: '72 cm' },
      { label: 'Depth', value: '84 cm' },
      { label: 'Height', value: '78 cm' },
      { label: 'Seat height', value: '40 cm' },
    ],
    pairsWith: ['zabarwan-lumbar-cushion', 'nishat-dining-chair-dal'],
  },
  {
    slug: 'zabarwan-lumbar-cushion',
    name: 'Zabarwan Lumbar Cushion',
    variant: 'Cocoa bouclé',
    collection: 'Zabarwan',
    category: 'cushions',
    price: 4800,
    upholstery: 'cocoa',
    tint: 'cocoa',
    image: zabarwanCushion,
    imageKind: 'photo',
    detail: detailZabarwan,
    room: sceneZabarwan,
    summary: 'The cushion from the Zabarwan chair, on its own.',
    story:
      'Cut from the same cocoa bouclé as the Zabarwan Lounge Chair. Add a second one to the chair, or bring the cloth onto a sofa or a window seat elsewhere in the room.',
    highlights: [
      'Cocoa bouclé, matched to the Zabarwan chair',
      'Sized to support the lower back',
      'Sewn in Nowgam, Srinagar',
    ],
    dimensions: [
      { label: 'Width', value: '50 cm' },
      { label: 'Height', value: '30 cm' },
    ],
    pairsWith: ['zabarwan-lounge-chair', 'nishat-pair'],
  },
];

export const productBySlug = Object.fromEntries(products.map((p) => [p.slug, p])) as Record<string, Product>;

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatPrice = (n: number) => inr.format(n);

export const productMaterials = (p: Product) =>
  [p.upholstery, ...(p.alsoUpholstered ?? []), p.frame].filter(Boolean).map((id) => materialById[id as string]);

export const categoryName = (id: CategoryId) => categories.find((c) => c.id === id)?.name ?? id;
