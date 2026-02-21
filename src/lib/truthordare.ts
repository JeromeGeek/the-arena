// Truth or Dare — game logic and prompt banks

export interface TruthOrDarePrompt {
  type: "truth" | "dare";
  text: string;
  intensity: "mild" | "spicy" | "extreme";
}

export const truths: TruthOrDarePrompt[] = [
  // ── MILD — actually uncomfortable, not baby stuff (25) ──
  { type: "truth", text: "What's the most embarrassing thing you've done in front of your crush?", intensity: "mild" },
  { type: "truth", text: "What's the biggest lie you've told to someone in this room?", intensity: "mild" },
  { type: "truth", text: "Who in this room would you hate to be stuck in an elevator with?", intensity: "mild" },
  { type: "truth", text: "What's the pettiest reason you've stopped talking to someone?", intensity: "mild" },
  { type: "truth", text: "What's the worst thing you've done and got away with?", intensity: "mild" },
  { type: "truth", text: "What's your most embarrassing search history entry?", intensity: "mild" },
  { type: "truth", text: "Have you ever talked trash about someone in this room? What did you say?", intensity: "mild" },
  { type: "truth", text: "What's the most cringe thing you've done to impress someone?", intensity: "mild" },
  { type: "truth", text: "Who in this room do you think is the worst at keeping secrets?", intensity: "mild" },
  { type: "truth", text: "What's the meanest thing you've said about a friend behind their back?", intensity: "mild" },
  { type: "truth", text: "Have you ever cried because of something embarrassing? What was it?", intensity: "mild" },
  { type: "truth", text: "What's the most desperate thing you've done for attention?", intensity: "mild" },
  { type: "truth", text: "Who is the person you secretly dislike but pretend to be friends with?", intensity: "mild" },
  { type: "truth", text: "What's the worst date you've been on and why?", intensity: "mild" },
  { type: "truth", text: "What's a habit of yours that would disgust people if they knew?", intensity: "mild" },
  { type: "truth", text: "What's the most embarrassing thing your parents have caught you doing?", intensity: "mild" },
  { type: "truth", text: "What's the longest you've gone without replying to someone on purpose?", intensity: "mild" },
  { type: "truth", text: "Who was the last person you screenshot a conversation with and sent to someone else?", intensity: "mild" },
  { type: "truth", text: "Have you ever lied about being busy just to avoid hanging out with someone here?", intensity: "mild" },
  { type: "truth", text: "What's the most embarrassing thing you've done while drunk?", intensity: "mild" },
  { type: "truth", text: "Who here have you judged the hardest and why?", intensity: "mild" },
  { type: "truth", text: "What's a promise you made to someone in this room and broke?", intensity: "mild" },
  { type: "truth", text: "What's the pettiest thing you've done to an ex?", intensity: "mild" },
  { type: "truth", text: "Who do you think talks about you behind your back?", intensity: "mild" },
  { type: "truth", text: "What's the most embarrassing notification that's popped up on your phone in public?", intensity: "mild" },

  // ── SPICY — 18+, relationships, hookups, secrets (25) ──
  { type: "truth", text: "What's the dirtiest thought you've had about someone in this room?", intensity: "spicy" },
  { type: "truth", text: "What's the most embarrassing thing that's happened to you during a hookup?", intensity: "spicy" },
  { type: "truth", text: "Have you ever sent nudes? Did they ever get leaked?", intensity: "spicy" },
  { type: "truth", text: "What's the freakiest thing you've ever done in bed?", intensity: "spicy" },
  { type: "truth", text: "Who was your worst kiss and why?", intensity: "spicy" },
  { type: "truth", text: "Have you ever hooked up with someone you found unattractive? Why?", intensity: "spicy" },
  { type: "truth", text: "What's the most number of people you've been involved with at the same time?", intensity: "spicy" },
  { type: "truth", text: "What's a kink you have that you've never told anyone?", intensity: "spicy" },
  { type: "truth", text: "Have you ever made out with someone to make another person jealous?", intensity: "spicy" },
  { type: "truth", text: "What's the most scandalous DM you've ever sent?", intensity: "spicy" },
  { type: "truth", text: "Have you ever cheated or helped someone cheat?", intensity: "spicy" },
  { type: "truth", text: "What's the wildest thing on your bucket list that involves another person?", intensity: "spicy" },
  { type: "truth", text: "Have you ever had a one night stand you regretted? Spill.", intensity: "spicy" },
  { type: "truth", text: "What's the most embarrassing thing in your camera roll right now?", intensity: "spicy" },
  { type: "truth", text: "Who in this room would you hook up with if there were zero consequences?", intensity: "spicy" },
  { type: "truth", text: "Have you ever faked an orgasm? How many times?", intensity: "spicy" },
  { type: "truth", text: "What's the weirdest place you've ever hooked up?", intensity: "spicy" },
  { type: "truth", text: "Have you ever lied about your body count? What's the real number?", intensity: "spicy" },
  { type: "truth", text: "What's something you've done sexually that you'd never do again?", intensity: "spicy" },
  { type: "truth", text: "Who was the rebound hookup you're most ashamed of?", intensity: "spicy" },
  { type: "truth", text: "Have you ever been the other person in someone's relationship knowingly?", intensity: "spicy" },
  { type: "truth", text: "What's the thirstiest thing you've ever done on social media?", intensity: "spicy" },
  { type: "truth", text: "Have you ever had a dream about someone here that you'd never tell them?", intensity: "spicy" },
  { type: "truth", text: "What's the most embarrassing thing you've said during an intimate moment?", intensity: "spicy" },
  { type: "truth", text: "Who in this room do you think has the most wild relationship history?", intensity: "spicy" },

  // ── EXTREME — brutal honesty, friendship-testing, no mercy (25) ──
  { type: "truth", text: "What's the most illegal thing you've done and gotten away with? Details.", intensity: "extreme" },
  { type: "truth", text: "Tell us a secret that could actually end a friendship in this room.", intensity: "extreme" },
  { type: "truth", text: "If you had to rank everyone here from most to least attractive, what's the order?", intensity: "extreme" },
  { type: "truth", text: "What's the worst thing you've ever said behind someone's back here? Say it now.", intensity: "extreme" },
  { type: "truth", text: "Have you ever betrayed someone's trust in this room? Confess.", intensity: "extreme" },
  { type: "truth", text: "Who here do you genuinely think is a bad influence? Why?", intensity: "extreme" },
  { type: "truth", text: "What's a dark secret about yourself that nobody in this room knows?", intensity: "extreme" },
  { type: "truth", text: "Who here would you cut off permanently if you could with no consequences?", intensity: "extreme" },
  { type: "truth", text: "What's the most toxic thing you've done in a relationship?", intensity: "extreme" },
  { type: "truth", text: "Who in this room are you most jealous of and why?", intensity: "extreme" },
  { type: "truth", text: "Have you ever lied to everyone in this room about the same thing? What was it?", intensity: "extreme" },
  { type: "truth", text: "What's the biggest regret of your life that still keeps you up at night?", intensity: "extreme" },
  { type: "truth", text: "If your search history was projected on the wall right now, what would shock people most?", intensity: "extreme" },
  { type: "truth", text: "Who here do you think is the fakest and why?", intensity: "extreme" },
  { type: "truth", text: "What's something you've done that you've convinced yourself to never tell a single soul?", intensity: "extreme" },
  { type: "truth", text: "If you could expose one person's secret in this room, whose would cause the most damage?", intensity: "extreme" },
  { type: "truth", text: "What relationship have you ruined and never apologized for?", intensity: "extreme" },
  { type: "truth", text: "What's the cruelest thing you've ever done to someone who trusted you?", intensity: "extreme" },
  { type: "truth", text: "Who in this room would you trust to keep a life-ruining secret? Who wouldn't you?", intensity: "extreme" },
  { type: "truth", text: "What have you done that would make your parents genuinely disown you?", intensity: "extreme" },
  { type: "truth", text: "If someone paid you a million dollars to expose your worst secret, would you? What is it?", intensity: "extreme" },
  { type: "truth", text: "Who here have you been two-faced with? Admit it.", intensity: "extreme" },
  { type: "truth", text: "What's the most manipulative thing you've ever done to get what you wanted?", intensity: "extreme" },
  { type: "truth", text: "What lie have you told so many times that people think it's true?", intensity: "extreme" },
  { type: "truth", text: "If the group voted to go through your entire phone for 5 minutes, what would you delete first?", intensity: "extreme" },
];

export const dares: TruthOrDarePrompt[] = [
  // ── MILD — actually challenging, not boring (25) ──
  { type: "dare", text: "Let the group go through your Instagram DMs for 30 seconds.", intensity: "mild" },
  { type: "dare", text: "Show the last 5 photos in your camera roll to everyone.", intensity: "mild" },
  { type: "dare", text: "Call your most recent contact and tell them you're in love with them.", intensity: "mild" },
  { type: "dare", text: "Let the group compose and send a text to anyone from your phone.", intensity: "mild" },
  { type: "dare", text: "Do an impression of the person to your left until someone guesses who it is.", intensity: "mild" },
  { type: "dare", text: "Post a story tagging everyone here saying 'These people know my darkest secrets'.", intensity: "mild" },
  { type: "dare", text: "Read aloud the last 10 messages between you and your crush.", intensity: "mild" },
  { type: "dare", text: "Let someone go through your 'Recently Deleted' photos.", intensity: "mild" },
  { type: "dare", text: "Show your screen time report to everyone.", intensity: "mild" },
  { type: "dare", text: "Send 'I need to tell you something important' to your last 3 chats. Don't reply for 10 min.", intensity: "mild" },
  { type: "dare", text: "Let the group pick a contact and you have to call them right now on speaker.", intensity: "mild" },
  { type: "dare", text: "Unlock your phone and hand it to the person to your right for 1 minute.", intensity: "mild" },
  { type: "dare", text: "Do 30 pushups or drink whatever the group mixes for you.", intensity: "mild" },
  { type: "dare", text: "Change your profile picture to whatever the group picks for 24 hours.", intensity: "mild" },
  { type: "dare", text: "Let the group record a 15-second video of you doing whatever they say.", intensity: "mild" },
  { type: "dare", text: "Show your most recent Google search to the group.", intensity: "mild" },
  { type: "dare", text: "Send 'thinking about you 😏' to a random contact the group picks.", intensity: "mild" },
  { type: "dare", text: "Let the person to your right post an Instagram story from your phone.", intensity: "mild" },
  { type: "dare", text: "Do a dramatic reading of your most embarrassing text conversation.", intensity: "mild" },
  { type: "dare", text: "Call your mom on speaker and tell her you got a tattoo.", intensity: "mild" },
  { type: "dare", text: "Show the last person you stalked on Instagram to the group.", intensity: "mild" },
  { type: "dare", text: "Let the group pick a song and you have to do the full dance. Film it.", intensity: "mild" },
  { type: "dare", text: "Read aloud the last voice note you sent.", intensity: "mild" },
  { type: "dare", text: "Text your boss or professor 'miss you ❤️' and don't explain for 30 minutes.", intensity: "mild" },
  { type: "dare", text: "Let the group search anything they want on your phone for 45 seconds.", intensity: "mild" },

  // ── SPICY — 18+, physical, flirty, embarrassing (25) ──
  { type: "dare", text: "Give a lap dance to the person the group picks.", intensity: "spicy" },
  { type: "dare", text: "Send a flirty voice note to the last person who texted you.", intensity: "spicy" },
  { type: "dare", text: "Let someone go through your entire chat with your ex. Read highlights aloud.", intensity: "spicy" },
  { type: "dare", text: "Take off one piece of clothing of the group's choice.", intensity: "spicy" },
  { type: "dare", text: "Text your ex 'I still think about us' and screenshot their reply.", intensity: "spicy" },
  { type: "dare", text: "Demonstrate your best kissing technique on the back of your hand.", intensity: "spicy" },
  { type: "dare", text: "Whisper something seductive in the ear of the person to your left.", intensity: "spicy" },
  { type: "dare", text: "Let the group write a Tinder bio for you and you have to use it for 48 hours.", intensity: "spicy" },
  { type: "dare", text: "Do your best fake moan for 10 seconds. No laughing.", intensity: "spicy" },
  { type: "dare", text: "Post a thirst trap on your story right now. The group picks the pose.", intensity: "spicy" },
  { type: "dare", text: "FaceTime someone and flirt with them for 30 seconds. No explaining why.", intensity: "spicy" },
  { type: "dare", text: "Act out the most awkward intimate moment you've ever had.", intensity: "spicy" },
  { type: "dare", text: "Text 'You up? 😏' to the 7th contact in your phone.", intensity: "spicy" },
  { type: "dare", text: "Let the group pick a song and you have to do a seductive dance to it.", intensity: "spicy" },
  { type: "dare", text: "Show the group the last spicy meme or video you saved.", intensity: "spicy" },
  { type: "dare", text: "Serenade the person across from you with the cheesiest love song you know.", intensity: "spicy" },
  { type: "dare", text: "Let someone blindfold you and you have to guess who's touching your hand.", intensity: "spicy" },
  { type: "dare", text: "Send a shirtless / thirst selfie to someone the group picks from your contacts.", intensity: "spicy" },
  { type: "dare", text: "Recreate your most embarrassing hookup story using only actions. Group guesses.", intensity: "spicy" },
  { type: "dare", text: "Call your crush on speaker and ask them on a date. No chickening out.", intensity: "spicy" },
  { type: "dare", text: "Do a body roll in front of the group. Maintain eye contact with one person.", intensity: "spicy" },
  { type: "dare", text: "Write a dirty text but don't send it. Read it aloud to the group.", intensity: "spicy" },
  { type: "dare", text: "Let the group go through your dating app matches and messages for 1 minute.", intensity: "spicy" },
  { type: "dare", text: "Bite your lip and give bedroom eyes to the person across from you for 15 seconds.", intensity: "spicy" },
  { type: "dare", text: "Record a 10-second voice note saying something flirty and send it to the 3rd contact.", intensity: "spicy" },

  // ── EXTREME — maximum chaos, social destruction (25) ──
  { type: "dare", text: "Give your phone unlocked to the group for 3 full minutes. They can do anything.", intensity: "extreme" },
  { type: "dare", text: "Let the group post anything they want on your main social media account.", intensity: "extreme" },
  { type: "dare", text: "Call your parents and tell them you got someone pregnant / you're pregnant.", intensity: "extreme" },
  { type: "dare", text: "Go live on Instagram for 60 seconds doing whatever the group tells you.", intensity: "extreme" },
  { type: "dare", text: "Send 'We need to talk' to your ex and put it on speaker when they reply.", intensity: "extreme" },
  { type: "dare", text: "Go outside and yell 'I just got dumped and I'm available!' at the top of your lungs.", intensity: "extreme" },
  { type: "dare", text: "Eat whatever food combination the group creates. No refusals.", intensity: "extreme" },
  { type: "dare", text: "Let the group create and send a message to your crush from your phone.", intensity: "extreme" },
  { type: "dare", text: "Call your boss/professor and tell them you love them.", intensity: "extreme" },
  { type: "dare", text: "Give a dramatic breakup speech to the person to your right. Record it.", intensity: "extreme" },
  { type: "dare", text: "Show the group your most embarrassing hidden app or folder.", intensity: "extreme" },
  { type: "dare", text: "Text your family group chat 'I have an announcement...' and don't reply for 1 hour.", intensity: "extreme" },
  { type: "dare", text: "Do a full minute of karaoke to a song the group picks. No backing out.", intensity: "extreme" },
  { type: "dare", text: "Go knock on your neighbor's door and ask if they have any relationship advice.", intensity: "extreme" },
  { type: "dare", text: "Switch phones with someone for the next 3 rounds. Full access.", intensity: "extreme" },
  { type: "dare", text: "Let the group go through your entire gallery for 2 minutes. No deleting.", intensity: "extreme" },
  { type: "dare", text: "Post on your main account: 'Who wants to be my rebound? Accepting applications.' Keep it up for 24hrs.", intensity: "extreme" },
  { type: "dare", text: "FaceTime your most recent ex on speaker and say 'I can't stop thinking about you.'", intensity: "extreme" },
  { type: "dare", text: "Send 'I know what you did' to the last 5 people you texted. Don't explain.", intensity: "extreme" },
  { type: "dare", text: "Let the group record a TikTok of you and post it from your account.", intensity: "extreme" },
  { type: "dare", text: "Call a random food delivery place and confess your love to whoever picks up.", intensity: "extreme" },
  { type: "dare", text: "Hand your phone to the group. They get to send one message to anyone. No veto.", intensity: "extreme" },
  { type: "dare", text: "Go outside and ask the first stranger you see for their number. Film it.", intensity: "extreme" },
  { type: "dare", text: "Let the group change your Tinder/dating profile and bio for 1 week.", intensity: "extreme" },
  { type: "dare", text: "Stand up and give a 30-second speech about why you're single. Everyone films.", intensity: "extreme" },
];

export type Intensity = "mild" | "spicy" | "extreme";

export interface TruthOrDareGame {
  players: string[];
  intensity: Intensity;
  currentPlayerIndex: number;
  currentPrompt: TruthOrDarePrompt | null;
  round: number;
  usedTruths: Set<number>;
  usedDares: Set<number>;
}

export function getRandomPrompt(
  type: "truth" | "dare",
  intensity: Intensity,
  usedIndices: Set<number>,
  randomFn: () => number = Math.random
): { prompt: TruthOrDarePrompt; index: number } | null {
  const pool = type === "truth" ? truths : dares;
  // Filter by intensity — include lower intensities too
  const intensityLevels: Intensity[] =
    intensity === "mild" ? ["mild"] :
    intensity === "spicy" ? ["mild", "spicy"] :
    ["mild", "spicy", "extreme"];
  
  const available = pool
    .map((p, i) => ({ prompt: p, index: i }))
    .filter((item) => intensityLevels.includes(item.prompt.intensity) && !usedIndices.has(item.index));

  if (available.length === 0) return null;
  const pick = available[Math.floor(randomFn() * available.length)];
  return pick;
}
