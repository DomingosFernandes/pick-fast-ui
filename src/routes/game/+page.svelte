<script lang="ts">
	import type { Player, QuestionState } from '../../models/Game';
	import type { PageData } from './$types';
	import { onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';

	export let data: PageData;

	let pageDiv: HTMLDivElement;
	let score: number = 0;
	let mmr_points = 50;
	let nextQuestionsUrl = data.next;

	let questions: Array<QuestionState> = [],
		currentQuestion: QuestionState,
		currentQuestionIndex: number = 0;
	let radiantTeam: Array<Player> = [],
		direTeam: Array<Player> = [];

	const positions = [
		{ role: 'Carry', pos: 1 },
		{ role: 'Mid', pos: 2 },
		{ role: 'Offlane', pos: 3 },
		{ role: 'Soft support', pos: 4 },
		{ role: 'Hard support', pos: 5 }
	];

	questions.push(data.question);

	onMount(() => {
		fetchMoreQuestions().catch(() => 'Error fetching more questions');
	});

	async function setRoleAnswer(e: any) {
		if (!currentQuestion.wasRoleAnswered) {
			currentQuestion.wasRoleAnswered = true;
			currentQuestion.roleSelected = +e.target.value;
			if (currentQuestion.roleSelected === currentQuestion.answer.position) score += mmr_points;
			currentQuestion = currentQuestion;
			await tick();
			scrollToBottom(pageDiv);
		}
	}

	function setHeroAnswer(e: any) {
		if (!currentQuestion.wasHeroAnswered) {
			currentQuestion.wasHeroAnswered = true;
			currentQuestion.heroSelected = +e.currentTarget.value;
			if (
				currentQuestion.answer.options.find(
					(option) => option.heroId === currentQuestion.heroSelected
				)?.wasPicked
			)
				score += mmr_points;
			currentQuestion = currentQuestion;
		}
	}

	const scrollToBottom = async (node: HTMLElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	async function fetchMoreQuestions() {
		const response = await fetch(nextQuestionsUrl);
		const { data } = await response.json();
		questions.push(...JSON.parse(JSON.stringify(data.questions)));
		nextQuestionsUrl = data.next;
		console.log(questions);
	}

	//Reactive updates
	$: {
		currentQuestion = questions[currentQuestionIndex];
		radiantTeam = currentQuestion.players.filter((player) => player.isRadiant);
		direTeam = currentQuestion.players.filter((player) => !player.isRadiant);

		if (direTeam.length > radiantTeam.length) {
			radiantTeam.push({ order: 9, local: 'your_pick', name: 'Last pick' } as Player);
		}
		if (radiantTeam.length > direTeam.length) {
			direTeam.push({ order: 9, local: 'your_pick', name: 'Last pick' } as Player);
		}
	}
	$: {
		console.log(currentQuestionIndex);
		if (
			currentQuestionIndex > 0 &&
			currentQuestionIndex === questions.length - 1 &&
			nextQuestionsUrl
		)
			fetchMoreQuestions().catch(() => 'Error fetching more questions');
	}
</script>

<!--height is needed for scroll transition to work-->
<div
	class="grid grid-rows-[auto,_1fr] text-mali min-h-screen h-screen overflow-auto w-full"
	bind:this={pageDiv}
>
	<!--Header with game title-->
	<div class="bg-gray-800 shadow-lg flex justify-between items-center">
		<span class="mx-6 my-2 text-2xl font-semibold italic text-white md:text-3xl">Pick fast bro</span
		>
		<span class="text-white text-xl mx-6">Your noob MMR: {score}</span>
	</div>

	<div class="bg-slate-300">
		<!--Match outcome-->
		<p class="py-4 px-2 text-center text-gray-800 text-[1.7rem] sm:text-[2rem]">
			{#if currentQuestion.lastPickRadiant}
				<span class="text-outline-400 text-green-600">Radiant </span>
			{:else}
				<span class="text-outline-400 text-red-500">Dire </span>
			{/if}
			<span>had last pick and</span>
			{#if currentQuestion.lastPickRadiant === currentQuestion.radiantWin}
				<span class="text-outline-400 text-green-600">won </span>
			{:else}
				<span class="text-outline-400 text-red-500">lost </span>
			{/if}
			<span>the game</span>
		</p>

		<!--Radiant and Dire drafts-->
		<div class="flex justify-around flex-col lg:flex-row ">
			<!--Radiant heroes-->
			<div class="flex justify-evenly gap-4 mx-4 my-2">
				{#each radiantTeam as radiantPick (radiantPick.order)}
					<div class="w-full sm:w-[88px] md:w-24 lg:w-full border-2 border-green-600">
						<img
							class="object-cover h-full w-full"
							src={'/images/' + radiantPick.local + '.png'}
							alt={radiantPick.name}
						/>
					</div>
				{/each}
			</div>

			<!--Draft visual divider-->
			<div class="w-1 bg-black hidden lg:block" />

			<!--Dire heroes-->
			<div class="flex justify-evenly gap-4 mx-4 my-2">
				{#each direTeam as direPick (direPick.order)}
					<div class="w-full sm:w-[88px] md:w-24 lg:w-full border-2 border-red-600">
						<img
							class="object-cover h-full w-full"
							src={'/images/' + direPick.local + '.png'}
							alt={direPick.name}
						/>
					</div>
				{/each}
			</div>
		</div>

		<div>
			<div class="mt-8 sm:mt-16 mx-2 p-2">
				<span class="text-2xl text-center block font-medium"
					>Which role is required for this draft ?</span
				>
			</div>
			<div class="grid grid-cols-4 sm:grid-cols-5 mx-6 my-1 gap-4 py-2 justify-center break-words">
				{#each positions as position (position.pos)}
					<button
						class="rounded-3xl border border-gray-700 p-[0.2em] 
								font-normal text-xl md:text-2xl text-white shadow-md
								col-span-2 last:col-start-2 last:col-end-4
								active:translate-y-1 transition-all duration-300
								sm:col-span-1 sm:last:col-span-1
							"
						class:bg-blue-600={!currentQuestion.wasRoleAnswered ||
							currentQuestion.roleSelected !== position.pos}
						class:bg-red-600={currentQuestion.wasRoleAnswered &&
							currentQuestion.roleSelected !== currentQuestion.answer.position &&
							currentQuestion.roleSelected === position.pos}
						class:bg-green-600={currentQuestion.wasRoleAnswered &&
							currentQuestion.answer.position === position.pos}
						value={position.pos}
						on:click={setRoleAnswer}>{position.role}</button
					>
				{/each}
			</div>
		</div>

		{#if currentQuestion.wasRoleAnswered}
			<div transition:fade={{ duration: 500, delay: 500 }}>
				<div class="mt-4 sm:mt-8 mx-2 p-2">
					<span class="text-2xl text-center block font-medium">
						Can you guess what was last picked as {positions[currentQuestion.answer.position - 1]
							.role} ?
					</span>
				</div>
				<div class="flex justify-center gap-4 mx-4 mt-8 pb-8">
					{#each currentQuestion.answer.options as heroOption (heroOption)}
						<button
							class="w-[72px] sm:w-20 md:w-[90px] lg:w-28 hover:scale-110 transition-all border-4"
							value={heroOption.heroId}
							disabled={!!currentQuestion.wasHeroAnswered}
							class:border-blue-600={!currentQuestion.wasHeroAnswered ||
								(currentQuestion.heroSelected !== heroOption.heroId && !heroOption.wasPicked)}
							class:border-red-600={currentQuestion.wasHeroAnswered &&
								currentQuestion.heroSelected === heroOption.heroId &&
								!heroOption.wasPicked}
							class:border-green-600={currentQuestion.wasHeroAnswered && heroOption.wasPicked}
							on:click={setHeroAnswer}
						>
							<img src={'/images/' + heroOption.local + '.png'} alt={heroOption.name} />
						</button>
					{/each}
				</div>
			</div>

			<!--Hack for scrolling to bottom of the page :P-->
			<div class="p-3 md:p-0" />
		{/if}
	</div>
	<div class="bg-gray-800 m-auto w-full flex flex-col md:flex-row">
		<div
			class="text-white flex gap-4 mx-4 my-2 py-2 opacity-0"
			class:opacity-100={currentQuestion.wasHeroAnswered}
		>
			<a href={`https://www.opendota.com/matches/${currentQuestion.match_id}`}
				>View match summary on OpenDota</a
			>
			<a href={`https://stratz.com/matches/${currentQuestion.match_id}`}
				>View match summary on Stratz</a
			>
		</div>
		<button
			class="text-white p-2 mx-auto my-4 md:ml-auto md:mr-4 border-2 border-white border-spacing-2"
			on:click={() => {
				if (currentQuestionIndex < questions.length - 1) currentQuestionIndex++;
			}}
			disabled={!currentQuestion.wasHeroAnswered}
		>
			{currentQuestion.wasHeroAnswered
				? currentQuestionIndex === questions.length - 1
					? ' No more matches for today '
					: ' Onto next training'
				: ' Answer the question before moving on to next'}
		</button>
	</div>
</div>
