export enum RouletteType {
  TIERS, DEMI, DOUBLE_TIERS, CARRE, ZONE, AUTRE
}

export class Roulette {
  mise: number;
  gain: number;
  perte: number;
  proba: number;
  gainMini: number;
  gainCroissant: boolean;
  titre: string;
  gap: number;
  miseMax: number;
  maxTry: number;
  dynamic: boolean;
  type: RouletteType;

  constructor(type: RouletteType, mise, gain, proba, titre = '', gainMini = 0, gap = 2, gainCroissant = false, miseMax = 1000000, maxTry = 100, dynamic = false) {
    this.type = type
    this.mise = mise;
    this.gain = gain;
    this.proba = proba;
    this.perte = 0;
    this.gap = gap;
    this.gainMini = gainMini;
    this.titre = titre;
    this.gainCroissant = gainCroissant;
    this.miseMax = miseMax;
    this.maxTry = maxTry;
    this.dynamic = dynamic;
  }
}