import axios from 'axios';
import qs from 'querystring';
import cheerio, { Cheerio, CheerioAPI } from 'cheerio';
import { pipe } from './utils';

const ENGRAVE_QUERY = '.profile-ability-engrave .swiper-container .swiper-wrapper ul li span';
const ENGRAVE_REGEX = /(.*) Lv\. (\d*)/;
const ACCESSORY_QUERY = '#profile-equipment .profile-equipment__slot div:has(img[src*=Acc])';
const EQUIPMENT_QUERY = '#profile-equipment .profile-equipment__slot div:has(img[src*=_Item])';
const EQUIPMENT_REGEX = /\+(\d+) (.*)/;
const STATUS_REGEX = /(\W+) (\W\d+)/;
const SPLIT_BREAKLINE_REGEX = /<BR>/i;
const ACCESSORY_ENGRAVE_REGEX = /\[(.*?)\] 활성도 \+(\d+)/;
const AVAILITY_STONE_QUERY = '#profile-equipment .profile-equipment__slot div.slot13:has(img)';
const SKILL_RUNE_REGEX = /(\W+) 스킬 룬/;
const BRACELET_QUERY = '#profile-equipment .profile-equipment__slot div.slot12:has(img)';
const BRACELET_REGEX = /(\W+) 팔찌/;
const AVAILITY_QUERY = '.profile-ability-basic ul li span';
const BATTLE_STATUS_QUERY = '.profile-ability-battle ul > li';
const JEWEL_QUERY = '#profile-jewel [id*=gem]';
const JEWEL_LEVEL_REGEX = /^(\d+)레벨/;
const CARD_LIST_QUERY = '#cardList li > div.card-slot';
const CARD_EFFECT_QUERY = '#cardSetList > li';
const MEMBER_NO_REGEX = /var _memberNo = '(.*)?';/;
const PC_ID_REGEX = /var _pcId = '(.*)?';/;
const WORLD_NO_REGEX = /var _worldNo = '(.*)?';/;
const TITLE_QUERY = '.game-info > .game-info__title span:last-child';
const GUILD_QUERY = '.game-info > .game-info__guild span:last-child';
const PVP_LEVEL_QUERY = '.game-info > .level-info__pvp span:last-child';
const NICKNAME_QUERY = '.profile-character-info__name';
const CHARACTER_IMG_QUERY = '#profile-equipment > .profile-equipment__character > img';


interface CharacterProfileEngrave {
	name: string;
	level: number;
}

interface CharacterProfileStatus {
	name: string;
	amount: number;
}

interface CharacterProfileBasicAvaility {
	offense: number;
	life: number;
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
	setName: string;
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
	grade: number;
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
	use: boolean;
}

interface CharacterProfileGems {
	index: number;
	description: string;
	icon: string;
	name: string;
	slotIndex: number;
}

interface CharacterProfileBracelet {
	name: string;
	title: string;
	iconPath: string;
	effects: string[];
}

interface CharacterProfileJewel {
	name: string;
	title: string;
	iconPath: string;
	level: number;
	effect: string;
	grade: number;
}

interface CharacterProfileCardEffect {
	title: string;
	description: string;
}

interface CharacterProfileCard {
	name: string;
	awakeCount: number;
	awakeTotal: number;
	iconPath: string;
	description: string;
	tierGrade: number;
}

interface CharacterProfileCardSet {
	effects: CharacterProfileCardEffect[];
	cardList: CharacterProfileCard[];
}

interface CharacterProfileCollection {
	heart: CharacterProfileCollectionItem;
	island: CharacterProfileCollectionItem;
	seed: CharacterProfileCollectionItem;
	art: CharacterProfileCollectionItem;
	voyage: CharacterProfileCollectionItem;
	tree: CharacterProfileCollectionItem;
	medal: CharacterProfileCollectionItem;
	star: CharacterProfileCollectionItem;
	memory: CharacterProfileCollectionItem;
}
type CollectionKey = keyof CharacterProfileCollection;

interface CharacterProfileCollectionListItem {
	title: string;
	isComplete: boolean;
}

interface CharacterProfileCollectionItem {
	title: string;
	max: number;
	now: number;
	list: CharacterProfileCollectionListItem[];
}

const searchEquipElementByType = (equip: any = {}, type: string) =>
	Object.entries(equip)
		.filter(([, element]) => (element as any)?.type === type)
		.map(([, element]) => element);

const getFirstItemFromArray = ([firstItem]) => firstItem;
const removeHtmlTag = (html: string) => cheerio.load(html).text().trim();
const removeChildren = ($: Cheerio<any>, selector) => $.clone().children(selector).remove().end();

export class CharacterProfile {
	private profile: any = {};
	private memberNo = '';
	private pcId = '';
	private worldNo = '';
	private cache = new Map();

	constructor(private $: CheerioAPI, body: string) {
		let t: any = body.match(/<script type="text\/javascript">[\s\S]*?= ([\s\S]*})?;/);
		if ( t === null ) throw Error('Cannot parsing profile information');
		this.profile = JSON.parse(t[1]);

		t = body.match(MEMBER_NO_REGEX);
		if ( t === null ) throw Error('Cannot parsing _memberNo variable');
		this.memberNo = t[1];

		t = body.match(PC_ID_REGEX);
		if ( t === null ) throw Error('Cannot parsing _pcId variable');
		this.pcId = t[1];

		t = body.match(WORLD_NO_REGEX);
		if ( t === null ) throw Error('Cannot parsing _worldNo variable');
		this.worldNo = t[1];

		return new Proxy(this, {
			get: (oTarget, sKey) => {
				if ( Object.getPrototypeOf(this).hasOwnProperty(sKey) ) {
					return this.cache.get(sKey) ||
						this.cache.set(sKey, oTarget[sKey])
						.get(sKey);
				}
				return oTarget[sKey];
			},
		})
	}

	get image(): string {
		return this.$(CHARACTER_IMG_QUERY).attr('src') || '';
	}

	get nickname(): string {
		return this.$(NICKNAME_QUERY).text().trim();
	}

	get itemLevel(): string {
		return this.$('.level-info2__item').text().match(/Lv\.([0-9,.]*)/)?.[1].replace(',', '') || '';
	}

	get expLevel(): number {
		return parseInt(this.$('.level-info__expedition').text().match(/Lv\.([0-9,.]*)/)?.[1] as string) || 0;
	}

	get level(): number {
		const level = this.$('.profile-character-info__lv').text().match(/\d+/);
		if ( level ) {
			return +level[0];
		}
		return 0;
	}

	get server(): string {
		return this.$('.profile-character-info__server').text().replace(/^@/, '') || '';
	}

	get job(): string {
		return this.$('.profile-character-info__img').attr('alt') || '';
	}

	get emblem(): string {
		return this.$('.profile-character-info__img').attr('src') || '';
	}

	get title(): string {
		return this.$(TITLE_QUERY).text().trim();
	}

	get pvpLevel(): string {
		return this.$(PVP_LEVEL_QUERY).text().trim();
	}

	get guild(): string {
		return this.$(GUILD_QUERY).text().trim();
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
						.map(([, name, amount]: RegExpMatchArray) => ({ name, amount: +amount }));
					obj.battleStatus = battleStatusBox.value.Element_001
						.split(SPLIT_BREAKLINE_REGEX)
						.map(removeHtmlTag)
						.map((str) => str.match(STATUS_REGEX))
						.map(([, name, amount]: RegExpMatchArray) => ({ name, amount: +amount }));
					obj.engraves = engraveBox.value.Element_001
						.split(SPLIT_BREAKLINE_REGEX)
						.map(removeHtmlTag)
						.map((str) => str.match(ACCESSORY_ENGRAVE_REGEX))
						.map(([, name, level]: RegExpMatchArray) => ({ name, level: +level }));
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
				(str) => str.match(EQUIPMENT_REGEX) || str,
				((val: string|RegExpMatchArray) => {
					if ( typeof val === 'string' ) {
						obj.name = val;
						obj.upgrade = 0;
					} else {
						obj.name = val[2];
						obj.upgrade = +val[1];
					}
				}),
			)(searchEquipElementByType(equip, 'NameTagBox'));

			pipe(
				getFirstItemFromArray,
				({ value }: any) => {
					obj.quality = +value.qualityValue;
					obj.iconPath = value.slotData.iconPath;
				},
			)(searchEquipElementByType(equip, 'ItemTitle'));

			obj.setName = pipe(
				(list: any[]) => list.find(item => removeHtmlTag(item.value.Element_000) === '세트 효과 레벨'),
				(element) => removeHtmlTag(element?.value?.Element_001 || ''),
			)(searchEquipElementByType(equip, 'ItemPartBox'));
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
			([ , , engraveBox ]) => {
				result.engraves = engraveBox.value.Element_001
					.split(SPLIT_BREAKLINE_REGEX)
					.map(removeHtmlTag)
					.map((str) => str.match(ACCESSORY_ENGRAVE_REGEX))
					.map(([, name, level]: RegExpMatchArray) => ({ name, level: +level }));
			},
		)(searchEquipElementByType(equip, 'ItemPartBox'));
		return result;
	}

	get gems(): CharacterProfileGems[] {
		const results: CharacterProfileGems[] = this.profile.GemSkillEffect?.map((obj) => ({
			index: obj.EquipGemSlotIndex,
			description: removeHtmlTag(obj.SkillDesc),
			icon: obj.SkillIcon,
			name: obj.SkillName,
			slotIndex: obj.SkillSlotIndex,
		})) || [];
		return results;
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
							newObj.title = (removeHtmlTag(value.leftStr0)
								.match(SKILL_RUNE_REGEX) as RegExpMatchArray)[1];
							newObj.iconPath = value.slotData.iconPath;
							newObj.grade = value.slotData.iconGrade;
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

			skill.use = (
				skill.level > 1 ||
				!!skill.rune ||
				!!this.gems.find((g) => g.name === skill.name)
			);
			results.push(skill as CharacterProfileSkill);
		});
		return results;
	}

	get bracelet(): CharacterProfileBracelet|undefined {
		const slot = this.$(BRACELET_QUERY);
		if ( !slot.length ) return;

		const itemKey = this.$(slot).data('item') as string;
		const equip = this.profile.Equip[itemKey];

		const obj: any = {};
		obj.name = pipe(
			getFirstItemFromArray,
			({ value }) => removeHtmlTag(value),
		)(searchEquipElementByType(equip, 'NameTagBox'));

		pipe(
			getFirstItemFromArray,
			({ value }) => {
				obj.title = (removeHtmlTag(value.leftStr0)
					.match(BRACELET_REGEX) as RegExpMatchArray)[1];
				obj.iconPath = value.slotData.iconPath;
			},
		)(searchEquipElementByType(equip, 'ItemTitle'));

		obj.effects = pipe(
			getFirstItemFromArray,
			({ value }) => value.Element_001.split(SPLIT_BREAKLINE_REGEX)
				.map(removeHtmlTag),
		)(searchEquipElementByType(equip, 'ItemPartBox'));

		return obj;
	}

	get basic(): CharacterProfileBasicAvaility {
		const basicTmp = this.$(AVAILITY_QUERY);
		const offense = parseInt(this.$(basicTmp[1]).text());
		const life = parseInt(this.$(basicTmp[3]).text());

		return {
			offense,
			life,
		};
	}

	get battle(): CharacterProfileBattleStatus[] {
		const battle: CharacterProfileBattleStatus[] = [];
		this.$(BATTLE_STATUS_QUERY).each((idx, elem) => {
			const child = this.$(elem).children('span');
			const name = this.$(child[0]).text();
			const amount = parseInt(this.$(child[1]).text());

			if ( name ) {
				battle.push({ name, amount });
			}
		});

		return battle;
	}

	get jewels(): CharacterProfileJewel[] {
		const jewels: CharacterProfileJewel[] = [];
		this.$(JEWEL_QUERY).each((idx, elem) => {
			const itemKey = this.$(elem).data('item') as string;
			const equip = this.profile.Equip[itemKey];

			const obj: any = {};

			obj.name = pipe(
				getFirstItemFromArray,
				({ value }) => removeHtmlTag(value),
			)(searchEquipElementByType(equip, 'NameTagBox'));

			obj.level = pipe(
				([, level]: RegExpMatchArray) => +level,
			)(obj.name.match(JEWEL_LEVEL_REGEX));

			pipe(
				getFirstItemFromArray,
				({ value }) => {
					obj.title = removeHtmlTag(value.leftStr0);
					obj.iconPath = value.slotData.iconPath;
					obj.grade = value.slotData.iconGrade;
				},
			)(searchEquipElementByType(equip, 'ItemTitle'));

			obj.effect = pipe(
				getFirstItemFromArray,
				({ value }) => removeHtmlTag(value.Element_001),
			)(searchEquipElementByType(equip, 'ItemPartBox'));
			jewels.push(obj as CharacterProfileJewel);
		});
		return jewels;
	}

	get card(): CharacterProfileCardSet {
		const effects: CharacterProfileCardEffect[] = [];
		const cardList: CharacterProfileCard[] = [];

		this.$(CARD_EFFECT_QUERY).each((idx, elem) => {
			effects.push({
				title: this.$(elem).children('.card-effect__title').text().trim(),
				description: this.$(elem).children('.card-effect__dsc').text().trim(),
			});
		});
		this.$(CARD_LIST_QUERY).each((idx, elem) => {
			const itemKey = this.$(elem).data('item') as string;
			const card = this.profile.Card[itemKey];
			const obj: any = {};

			obj.name = pipe(
				getFirstItemFromArray,
				({ value }) => removeHtmlTag(value),
			)(searchEquipElementByType(card, 'NameTagBox'));

			pipe(
				getFirstItemFromArray,
				({ value }) => {
					obj.awakeCount = value.awakeCount;
					obj.awakeTotal = value.awakeTotal;
					obj.tierGrade = value.tierGrade;
					obj.iconPath = value.iconData.iconPath;
				},
			)(searchEquipElementByType(card, 'Card'));

			obj.description = pipe(
				getFirstItemFromArray,
				({ value }) => removeHtmlTag(value),
			)(searchEquipElementByType(card, 'SingleTextBox'));
			cardList.push(obj as CharacterProfileCard);
		});

		return {
			effects,
			cardList,
		};
	}

	get collection(): Promise<CharacterProfileCollection> {
		return (async () => {
			const res = await axios({
				url: `https://lostark.game.onstove.com/Profile/GetCollection`,
				method: 'post',
				data: {
					memberNo: this.memberNo,
					worldNo: this.worldNo,
					pcId: this.pcId,
				},
			});
			const $ = cheerio.load(res.data);
			
			function getCollection(name: CollectionKey): CharacterProfileCollectionItem {
				const title = $(`.lui-tab__content.${name} span.collection-image > img`).attr('alt') as string;
				const collection = $(`.lui-tab__content.${name} .collection-list`);
				const nowCount = +$(collection).find('.now-count').text();
				const maxCount = +$(collection).find('.max-count').text();
				const list: CharacterProfileCollectionListItem[] = [];

				$(collection).find('.collection-list ul.list > li').each((idx, elem) => {
					const isComplete = !!$(elem).hasClass('complete');
					const title = removeChildren($(elem), ':not(em:has(span))')
						.text()
						.replace(/\//g, ' /') // for seed world status
						.replace(/\s+/g, ' ')
						.trim();
					list.push({
						isComplete,
						title,
					});
				});
				return {
					title,
					now: nowCount,
					max: maxCount,
					list,
				};
			}

			const collectionKey: CollectionKey[] = ['heart', 'island', 'seed', 'art', 'voyage', 'tree', 'medal', 'star', 'memory'];
			
			return Object.fromEntries(collectionKey.map((key: CollectionKey) => [
				key,
				getCollection(key),
			])) as any;
		})();
	}
}

export async function char(name: string): Promise<CharacterProfile|undefined> {
	const res = await axios.get(`https://lostark.game.onstove.com/Profile/Character/${qs.escape(name)}`);
	const $ = cheerio.load(res.data);
    try {
        return new CharacterProfile($, res.data);
    } catch (err) {
        //return err;
    }
}
