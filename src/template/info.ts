import { CharacterProfile } from "../char";
import path from 'path';

const engraveImagePath = (name: string) => path.join(__dirname, `engrave-imgs/${name}.png`);

export const infoToHTML = (info: CharacterProfile): string =>
/* html */ `
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<script src="https://cdn.tailwindcss.com"></script>
	<style>
		.avatar-box {
			background-image: url(${info.image});
			height: 400px;
			background-size: contain;
			background-repeat: no-repeat;
			background-position: right;
			background-color: #15181D;
		}

		.skill-lun {
			background-color: #f3f3f3;
			border-radius: 50%;
			width: 45px;
			height: 45px;
			box-shadow: inset 0 0 6px 0 rgb(0 0 0 / 10%);
		}

		.skill-lun[data-grade="4"] {
			background-image: linear-gradient(315deg,#9e5f04 2%,#362003 80%);
		}
		.skill-lun[data-grade="3"] {
			background-image: linear-gradient(315deg,#480d5d 2%,#261331 80%);
		}
		.skill-lun[data-grade="2"] {
			background-image:linear-gradient(315deg,#304911 2%,#18220b 80%)
		}
		.skill-lun[data-grade="1"] {
			background-image:linear-gradient(315deg,#113d5d 2%,#111f2c 80%)
		}
		.skill-lun.awake {
			background-image: url(https://www.onstove.com/assets/images/main/lostark/ico_skill_awakening.png);
			background-size: contain;
		}

		.card {
			position: relative;
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
		}
		.card:before {
			width: 142px;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: url(https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/profile/img_card_grade.png) no-repeat;
			content: "";
			background-size: cover;
		}
		.card strong {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			z-index: 1;
			padding: 14px 8px;
			font-size: 14px;
			text-align: center;
			font-weight: 400;
			line-height: 16px;
			word-break: keep-all;
			
		}

		.card[data-grade="5"]:before {
			background-position: -650px 0;
		}
		.card[data-grade="5"] strong {
			color: #ffba16;
		}
		.card[data-grade="4"]:before {
			background-position: -488px 0;
		}
		.card[data-grade="4"] strong {
			color: #bf33ec;
		}
		.card[data-grade="3"]:before {
			background-position: -326px 0;
		}
		.card[data-grade="3"] strong {
			color: #46a1ff;
		}
		.card[data-grade="2"]:before {
			background-position: -165px 0;
		}
		.card[data-grade="2"] strong {
			color: #91fe02;
		}
		.card[data-grade="1"]:before {
			background-position: -3px 0;
		}
		.card[data-grade="1"] strong {
			color: #ffffff;
		}

		.card .card-awake {
			position: absolute;
			bottom: 14px;
			left: 50%;
			width: 120px;
			height: 36px;
			margin-left: -60px;
			background: url(https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/profile/img_profile_awake.png?3de24b2…) no-repeat 0 0;
			font-size: 0;
		}
		.card[data-awakemax="5"] .card-awake,
		.card[data-awake="5"] .card-awake .awake {
			width: 120px;
		}
		.card[data-awakemax="4"] .card-awake,
		.card[data-awake="4"] .card-awake .awake {
			width: 96px;
		}
		.card[data-awakemax="3"] .card-awake,
		.card[data-awake="3"] .card-awake .awake {
			width: 72px;
		}
		.card[data-awakemax="2"] .card-awake,
		.card[data-awake="2"] .card-awake .awake {
			width: 48px;
		}
		.card[data-awakemax="1"] .card-awake,
		.card[data-awake="1"] .card-awake .awake {
			width: 24px;
		}

		.card .card-awake .awake {
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			height: 100%;
			background: url(https://cdn-lostark.game.onstove.com/2018/obt/assets/images/pc/profile/img_profile_awake.png?3de24b2…) no-repeat 0 -36px;
			font-size: 0;
		}

		.jewel[data-grade="5"] {
			background: linear-gradient(135deg,#3b1303,#a23405);
		}
		.jewel[data-grade="4"] {
			background: linear-gradient(135deg,#3c2201,#a86200);
		}
		.jewel[data-grade="3"] {
			background: linear-gradient(135deg,#27013d,#6e00aa);
		}
		.jewel[data-grade="2"] {
			background: linear-gradient(135deg,#111d29,#103550);
		}
		.jewel[data-grade="1"] {
			background: linear-gradient(135deg,#1a230e,#374e18);
		}
	</style>
</head>
<body>
	<!-- S: 기본 정보 -->
	<div class="grid grid-cols-3 avatar-box text-white">
		<div class="grid col-span-2">
			<div class="grid grid-rows-3">
				<div class="flex row-span-1 items-center mx-10">
					<h1 class="text-3xl font-bold">
						<p class="text-sm font-normal mb-1 text-gray-300">${info.title}</p>
						${info.nickname}
					</h1>
				</div>
				<div class="row-span-2 grid grid-rows-5 mx-10 my-10 text-sm">
					<div class="row-span-1 grid grid-cols-2 items-center">
						<div class="col-span-1">
							전투 레벨
						</div>
						<div class="col-span-1">
							<h1>${info.level}</h1>
						</div>
					</div>
					<div class="row-span-1 grid grid-cols-2 items-center">
						<div class="col-span-1">
							장착 아이템 레벨
						</div>
						<div class="col-span-1">
							<h1 class="text-xl text-orange-300">${info.itemLevel}</h1>
						</div>
					</div>
					<div class="row-span-1 grid grid-cols-2 items-center">
						<div class="col-span-1">
							원정대 레벨
						</div>
						<div class="col-span-1">
							<h1>${info.expLevel}</h1>
						</div>
					</div>
					<div class="row-span-1 grid grid-cols-2 items-center">
						<div class="col-span-1">
							서버
						</div>
						<div class="col-span-1">
							<h1>${info.server}</h1>
						</div>
					</div>
					<div class="row-span-1 grid grid-cols-2 items-center">
						<div class="col-span-1">
							직업
						</div>
						<div class="col-span-1">
							<h1>${info.job}</h1>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- E: 기본 정보 -->
	<!-- S: 카드 -->
	<div class="px-10" style="background-color: #15181D; min-height: 240px;">
		<div class="flex flex-row" style=" position: relative;  height: 220px;">
			${
				info.card.cardList.map((card, index) =>
				/* html */ `
				<div class="basis-1/6 card ${index < info.card.cardList.length-1 ? 'mr2' : ''}" data-grade="${card.tierGrade}" data-awakemax="${card.awakeTotal}" data-awake="${card.awakeCount}" style="background-image: url(https://cdn-lostark.game.onstove.com/${card.iconPath});">
					<strong>${card.name}</strong>
					<div class="card-awake">
						<div class="awake"></div>
					</div>
				</div>
				`)
			}
		</div>
		<div class="grid grid-cols-2 p-6 pt-2 text-white">
			${
				info.card.effects.map((effect) =>
				/* html */`
				<div class="col-span-1 mt-4">
					<h1 class="text-green-500 text-lg">${effect.title}</h1>
					<p>${effect.description}</p>
				</div>
				`).join('\n')
			}
		</div>
	</div>
	<!-- E: 카드 -->
	<!-- S: 특성, 각인 -->
	<div class="grid grid-cols-2">
		<!-- S: 특성 -->
		<div class="col-span-1 mx-5 mt-10">
			<h1 class="text-xl mb-5">기본 특성</h1>
			<div class="grid grid-cols-2 ml-2">
				<div class="col-span-1">
					<h2>공격력</h2>
				</div>
				<div class="col-span-1 text-right text-violet-700">
					${info.basic.offense.toLocaleString('ko-KR')}
				</div>
			</div>
			<hr class="my-3"></hr>
			<div class="grid grid-cols-2 ml-2">
				<div class="col-span-1">
					<h2>최대 생명력</h2>
				</div>
				<div class="col-span-1 text-right text-violet-700">
					${info.basic.life.toLocaleString('ko-KR')}
				</div>
			</div>
			<hr class="mt-3"></hr>
			<h1 class="text-xl mb-5 mt-12">전투 특성</h1>
			<div class="grid grid-cols-2">
				${
					info.battle.map((battle) =>
					/* html */`
					<div class="col-span-1 grid grid-cols-2 mx-2 mt-2">
						<div class="col-span-1">
							<h2>${battle.name}</h2>
						</div>
						<div class="col-span-1 text-right text-violet-700">
							${battle.amount}
						</div>
						<hr class="mt-3 col-span-2"></hr>
					</div>
					`).join('\n')
				}
			</div>
		</div>
		<!-- E: 특성 -->
		<!-- S: 각인 -->
		<div class="col-span-1 mx-5 mt-10">
			<h1 class="text-xl mb-5">각인 효과</h1>
			<hr class="mt-2">
			${
				info.engrave.map((engrave) =>
				/* html */`
				<div class="grid grid-cols-5 items-center mt-3 ml-2">
					<div class="col-span-1">
						<img src="${engraveImagePath(engrave.name)}" width="40px">
					</div>
					<div class="col-span-4">
						<h1 class="text-base font-medium">${engrave.name} Lv. ${engrave.level}</h1>
					</div>
				</div>
				`).join('\n')
			}
		</div>
		<!-- S: 각인 -->
	</div>
	<!-- E: 특성, 각인 -->
	<!-- S: 장비 -->
	<div class="grid grid-cols-2 mt-10 px-4">
		<!-- S: 장비 -->
		<div class="col-span-1 mx-1 mt-10">
			<h1 class="text-xl mb-5">장비</h1>
			${
				info.equipment.map((equipment) =>
				/* html */`
				<figure class="flex py-2 px-4">
					<div class="grid grid-rows-1 w-14 h-14 items-end bg-contain bg-no-repeat" style="background-image: url(https://cdn-lostark.game.onstove.com/${equipment.iconPath})">
						<div class="row-span-1 bg-gray-200 text-center text-xs">
							${equipment.quality}
						</div>
					</div>
					<figcaption class="font-medium pl-5">
						<div class="">+${equipment.upgrade} ${equipment.name}</div>
						<div class="font-base">
							<span class="px-2 py-1 mt-1 rounded-full text-gray-500 bg-gray-200 font-medium text-xs flex align-center w-max">
								${equipment.setName}
							</span>
						</div>
					</figcaption>
				</figure>
				`).join('\n')
			}
			<!-- S: 팔찌 -->
			${
				info.bracelet
				? /* html */`
				<figure class="flex py-2 px-4">
					<img class="w-14 h-14" src="https://cdn-lostark.game.onstove.com/${info.bracelet.iconPath}">
					<div>
						<div class="row-span-1 h-10 ml-5">${info.bracelet.name}</div>
						<div class="text-sm pl-5 font-light">
							${
								info.bracelet.effects.map((effect) =>
								/* html */`
								<p>${effect}<p>
								`).join('\n')
							}
						</div>
					</div>
				</figure>
				`
				: ''
			}
			<!-- E: 팔찌 -->
		</div>
		<!-- E: 장비 -->
		<!-- S: 장신구 -->
		<div class="col-span-1 mx-1 mt-10">
			<h1 class="text-xl mb-5">장신구</h1>
			${
				info.accessory.map((accessory) =>
				/* html */`
				<figure class="flex py-2 px-4">
					<div class="grid grid-rows-1 w-14 h-14 items-end bg-contain bg-no-repeat" style="background-image: url(https://cdn-lostark.game.onstove.com/${accessory.iconPath})">
						<div class="row-span-1 bg-gray-200 text-center text-xs">
							${accessory.quality}
						</div>
					</div>
					<figcaption class="font-medium pl-5">
						<div class="">${accessory.name}</div>
						<div class="font-base flex">
							${
								accessory.battleStatus.map((status, index) =>
								/* html */`
								<span class="px-2 py-1 mt-1 rounded-full text-gray-500 bg-gray-200 font-medium text-xs flex align-center w-max ${index < accessory.battleStatus.length-1 ? 'mr-1' : ''}">
									${status.name} ${status.amount}
								</span>
								`).join('\n')
							}
						</div>
						<div class="font-base flex">
							${
								accessory.engraves.map((engrave, index) =>
								/* html */`
								<span class="px-2 py-1 mt-1 rounded-full text-gray-500 bg-gray-200 font-medium text-xs flex align-center w-max ${index < accessory.engraves.length-1 ? 'mr-1' : ''}">
									${engrave.name} ${engrave.level}
								</span>
								`).join('\n')
							}
						</div>
					</figcaption>
				</figure>
				`).join('\n')
			}
			
			${
				info.availityStone
				? /* html */`
				<figure class="flex py-2 px-4">
					<div class="grid grid-rows-1 w-14 h-14 items-end bg-contain bg-no-repeat" style="background-image: url(https://cdn-lostark.game.onstove.com/${info.availityStone.iconPath})">
					</div>
					<figcaption class="font-medium pl-5">
						<div class="">${info.availityStone.name}</div>
						<div class="flex font-base">
							${
								info.availityStone.engraves.map((engrave) =>
								/* html */`
								<span class="mr-2 px-2 py-1 mt-1 rounded-full text-gray-500 bg-gray-200 font-base text-xs flex align-center w-max">
									${engrave.name} <span class="font-bold ml-2">${engrave.level}</span>
								</span>
								`).join('\n')
							}
						</div>
					</figcaption>
				</figure>
				`
				: ''
			}
		</div>
		<!-- E: 장신구 -->
	</div>
	<!-- E: 장비 -->
	<!-- S: 스킬 -->
	<div class="grid grid-cols-1 mt-10 px-4">
		<div class="col-span-1 mx-1">
			<h1 class="text-xl mb-5">스킬</h1>
		</div>
		${
			info.skills
			.filter((skill) => skill.use)
			.map((skill) =>
			/* html */`
			<div class="col-span-1 mx-1">
				<figure class="flex py-2 px-4">
					<div class="grid grid-rows-1 w-14 h-14 items-end bg-contain bg-no-repeat" style="background-image: url(https://cdn-lostark.game.onstove.com/${skill.slotIcon})">
					</div>
					<figcaption class="font-medium pl-5">
						<div class=""><span>${skill.type}</span> <span class="font-light">${skill.name}</span></div>
						<div class="font-base flex">
							${
								skill.selectedTripodTier
								.filter((selected) => selected > 0)
								.map((slot, index) => skill.tripodList.filter((t) => t.level === index).find((t) => t.slot === slot))
								.map((tridpod: any) =>
								/* html */`
								<span class="px-2 py-1 mt-1 rounded-full text-gray-500 bg-gray-200 font-medium text-xs flex align-center w-max mr-1">
									<img class="w-4 h-4 mr-1" src="https://cdn-lostark.game.onstove.com/${tridpod.slotIcon}">
									${tridpod.name}
								</span>
								`).join('\n')
							}
						</div>
					</figcaption>
					<div class="flex ml-auto align-center">
						<div class="my-auto grid-rows-2 mr-3">
							${
								info.jewels
								.filter((j) => j.effect.includes(skill.name))
								.map((jewel, index, arg) =>
								/* html */`
								<div class="row-span-1 flex ${index < arg.length-1 ? 'mb-1' : ''}">
									<span class="rounded-full jewel" data-grade="${jewel.grade}">
										<img class="w-6 h-6" src="https://cdn-lostark.game.onstove.com/${jewel.iconPath}">
									</span>
									<span class="ml-1">${jewel.name.replace('의 보석', '')}</span>
								</div>
								`).join('\n')
							}
						</div>
						<div class="ml-1 my-auto skill-lun" ${ skill.rune ? `data-grade="${skill.rune.grade}"` : ''}>
							${
								skill.rune
								? /* html */ `<img src="https://cdn-lostark.game.onstove.com/${skill.rune.iconPath}">`
								: ''
							}
						</div>
					</div>
				</figure>
			</div>
			`).join('\n')
		}
	</div>
	<!-- E: 스킬 -->
</body>
</html>`;