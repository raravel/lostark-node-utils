import axios from 'axios';
import qs from 'querystring';
import cheerio, { CheerioAPI } from 'cheerio';
import { pipe } from './utils';

const ENGRAVE_QUERY = '.profile-ability-engrave .swiper-container .swiper-wrapper ul li span';
const ENGRAVE_REGEX = /(.*) Lv\. (\d*)/;
const ACCESSORY_QUERY = '#profile-equipment .profile-equipment__slot div:has(img[src*=Acc])';
const EQUIPMENT_QUERY = '#profile-equipment .profile-equipment__slot div:has(img[src*=BL_Item])';
const EQUIPMENT_REGEX = /\+(\d+) (.*)/;
const STATUS_REGEX = /(\W+) (\W\d+)/;
const SPLIT_BREAKLINE_REGEX = /<BR>/i;
const ACCESSORY_ENGRAVE_REGEX = /\[(.*?)\] 활성도 \+(\d+)/;
const AVAILITY_STONE_QUERY = '#profile-equipment .profile-equipment__slot div.slot13:has(img)';
const SKILL_RUNE_REGEX = /(\W+) 스킬 룬/;

interface CharacterProfileEngrave {
	name: string;
	level: number;
}

interface CharacterProfileStatus {
	name: string;
	amount: number;
}

interface CharacterProfileBattleStatus {
	name: string;
	amount: number;
}

interface CharacterProfileAccessory {
	name: string;
	quality: number;
	iconPath: string;
	status: CharacterProfileStatus[];
	battleStatus: CharacterProfileBattleStatus[];
	engraves: CharacterProfileEngrave[];
}

interface CharacterProfileEquipment {
	name: string;
	quality: number;
	iconPath: string;
	upgrade: number;
}

interface CharacterProfileAvailityStone {
	name: string;
	iconPath: string;
	engraves: CharacterProfileEngrave[];
}

interface SkillRune {
	name: string;
	title: string;
	effect: string;
	iconPath: string;
}

interface SkillTripod {
	level: number;
	featureLevel: number;
	description: string;
	name: string;
	slot: number;
	slotIcon: string;
}

interface CharacterProfileSkill {
	awakening: false;
	id: number;
	index: number;
	level: number;
	masterRatio: number;
	name: string;
	rune?: SkillRune;
	selectedTripodTier: number[];
	slotIcon: string;
	tripodList: SkillTripod[];
	type: string;
}

const searchEquipElementByType = (equip: any = {}, type: string) =>
	Object.entries(equip)
		.filter(([key, element]) => (element as any)?.type === type)
		.map(([key, element]) => element);

const getFirstItemFromArray = ([firstItem]) => firstItem;
const removeHtmlTag = (html: string) => cheerio.load(html).text().trim();

class CharacterProfile {
	private profile: any = {};
	constructor(private $: CheerioAPI, body: string) {
		const t: any = body.match(/<script type="text\/javascript">[\s\S]*?= ([\s\S]*})?;/);
		if ( t === null ) throw Error('Cannot parsing profile information');
		this.profile = JSON.parse(t[1]);
	}

	get engrave(): CharacterProfileEngrave[] {
		const results: CharacterProfileEngrave[] = [];
		this.$(ENGRAVE_QUERY).each((index, el): void => {
			const m = this.$(el).text().match(ENGRAVE_REGEX) as RegExpMatchArray;
			if ( m ) {
				results.push({
					name: m[1],
					level: +m[2],
				});
			}
		});
		return results;
	}

	get accessory(): CharacterProfileAccessory[] {
		const results: CharacterProfileAccessory[] = [];
		this.$(ACCESSORY_QUERY).each((index, el): void => {
			const obj: any = {};
			const itemKey = this.$(el).data('item') as string;
			const equip = this.profile.Equip[itemKey];
			
			obj.name = pipe(
				getFirstItemFromArray,
				({ value }: any) => this.$(value).text(),
			)(searchEquipElementByType(equip, 'NameTagBox'));
			pipe(
				getFirstItemFromArray,
				({ value }) => {
					obj.quality = +value.qualityValue;
					obj.iconPath = value.slotData.iconPath;
				},
			)(searchEquipElementByType(equip, 'ItemTitle'));

			if ( obj.quality < 0 ) {
				// TODO: 팔찌일 경우
				return;
			}

			pipe(
				(([ statusBox, battleStatusBox, engraveBox ]) => {
					obj.status = statusBox.value.Element_001
						.split(SPLIT_BREAKLINE_REGEX)
						.map(removeHtmlTag)
						.map((str) => str.match(STATUS_REGEX))
						.map(([m, name, amount]: RegExpMatchArray) => ({ name, amount: +amount }));
					obj.battleStatus = battleStatusBox.value.Element_001
						.split(SPLIT_BREAKLINE_REGEX)
						.map(removeHtmlTag)
						.map(([m, name, amount]: RegExpMatchArray) => ({ name, amount: +amount }));
					obj.engraves = engraveBox.value.Element_001
						.split(SPLIT_BREAKLINE_REGEX)
						.map(removeHtmlTag)
						.map((str) => str.match(ACCESSORY_ENGRAVE_REGEX))
						.map(([m, name, level]: RegExpMatchArray) => ({ name, level: +level }));
				}),
			)(searchEquipElementByType(equip, 'ItemPartBox'));
			results.push(obj as CharacterProfileAccessory);
		});
		return results;
	}

	get equipment(): CharacterProfileEquipment[] {
		const results: CharacterProfileEquipment[] = [];
		this.$(EQUIPMENT_QUERY).each((index, el) => {
			const obj: any = {};
			const itemKey = this.$(el).data('item') as string;
			const equip = this.profile.Equip[itemKey];

			pipe(
				getFirstItemFromArray,
				({ value }: any) => removeHtmlTag(value),
				(str) => str.match(EQUIPMENT_REGEX),
				(([m, upgrade, name]: RegExpMatchArray) => {
					obj.name = name;
					obj.upgrade = +upgrade;
				}),
			)(searchEquipElementByType(equip, 'NameTagBox'));

			pipe(
				getFirstItemFromArray,
				({ value }: any) => {
					obj.quality = +value.qualityValue;
					obj.iconPath = value.slotData.iconPath;
				},
			)(searchEquipElementByType(equip, 'ItemTitle'));
			results.push(obj as CharacterProfileEquipment);
		});
		return results;
	}

	get availityStone(): CharacterProfileAvailityStone|undefined {
		const result: any = {};
		
		const slot = this.$(AVAILITY_STONE_QUERY);
		if ( !slot.length ) return;

		const itemKey = this.$(slot).data('item') as string;
		const equip = this.profile.Equip[itemKey];

		result.name = pipe(
			getFirstItemFromArray,
			({ value }: any) => removeHtmlTag(value),
		)(searchEquipElementByType(equip, 'NameTagBox'));

		result.iconPath = pipe(
			getFirstItemFromArray,
			( { value }: any) => value.slotData.iconPath,
		)(searchEquipElementByType(equip, 'ItemTitle'));

		pipe(
			([ defaultBox, bonusBox, engraveBox ]) => {
				result.engraves = engraveBox.value.Element_001
					.split(SPLIT_BREAKLINE_REGEX)
					.map(removeHtmlTag)
					.map((str) => str.match(ACCESSORY_ENGRAVE_REGEX))
					.map(([m, name, level]: RegExpMatchArray) => ({ name, level: +level }));
			},
		)(searchEquipElementByType(equip, 'ItemPartBox'));
		return result;
	}

	get skills(): CharacterProfileSkill[] {
		const results: CharacterProfileSkill[] = [];
		this.$('#profile-skill .profile-skill__item a').each((index, el) => {
			const skill: any = this.$(el).data('skill');
			skill.type = removeHtmlTag(skill.type);

			skill.rune = pipe(
				(rune) => {
					if ( !rune ) return;
					rune.tooltip = JSON.parse(rune.tooltip);
					const newObj: any = {};
					newObj.name = pipe(
						getFirstItemFromArray,
						({ value }) => removeHtmlTag(value),
					)(searchEquipElementByType(rune.tooltip, 'NameTagBox'))

					pipe(
						getFirstItemFromArray,
						({ value }) => {
							newObj.title = removeHtmlTag(value.leftStr0);
							newObj.iconPath = value.slotData.iconPath;
						},
					)(searchEquipElementByType(rune.tooltip, 'ItemTitle'));

					newObj.effect = pipe(
						getFirstItemFromArray,
						({ value }) => value.Element_001,
					)(searchEquipElementByType(rune.tooltip, 'ItemPartBox'));
					return newObj;
				},
			)(skill.rune) as SkillRune;

			skill.tripodList = skill.tripodList.map((tridpod) => {
				tridpod.description = removeHtmlTag(tridpod.description);
				tridpod.name = removeHtmlTag(tridpod.name);
				return tridpod;
			});
			results.push(skill as CharacterProfileSkill);
		});
		return results;
	}
}

export async function char(name: string) {
	const res = await axios.get(`https://lostark.game.onstove.com/Profile/Character/${qs.escape(name)}`);
	const $ = cheerio.load(res.data);
	return new CharacterProfile($, res.data);
}