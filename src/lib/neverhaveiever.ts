// Never Have I Ever — game logic and prompt banks

export interface NeverHaveIEverPrompt {
  text: string;
  intensity: "wild" | "spicy" | "chaos";
}

export const prompts: NeverHaveIEverPrompt[] = [
  // ── WILD — messy, embarrassing, juicy confessions ──
  { text: "Never have I ever stalked my ex's profile at 3am.", intensity: "wild" },
  { text: "Never have I ever gone through someone's phone without permission.", intensity: "wild" },
  { text: "Never have I ever talked shit about my best friend.", intensity: "wild" },
  { text: "Never have I ever screenshot a conversation to show someone else.", intensity: "wild" },
  { text: "Never have I ever been kicked out of a bar or party.", intensity: "wild" },
  { text: "Never have I ever drunk-texted someone I shouldn't have.", intensity: "wild" },
  { text: "Never have I ever thrown up on someone.", intensity: "wild" },
  { text: "Never have I ever been caught in a lie and had to double down.", intensity: "wild" },
  { text: "Never have I ever kissed someone just to make someone else jealous.", intensity: "wild" },
  { text: "Never have I ever told someone I loved them without meaning it.", intensity: "wild" },
  { text: "Never have I ever broken up with someone over text.", intensity: "wild" },
  { text: "Never have I ever stolen something and never got caught.", intensity: "wild" },
  { text: "Never have I ever started a rumor about someone.", intensity: "wild" },
  { text: "Never have I ever had a fake ID.", intensity: "wild" },
  { text: "Never have I ever pretended to be someone else online.", intensity: "wild" },
  { text: "Never have I ever been on a date with someone while talking to someone else.", intensity: "wild" },
  { text: "Never have I ever walked in on someone doing something I wished I hadn't seen.", intensity: "wild" },
  { text: "Never have I ever had a wardrobe malfunction in front of my crush.", intensity: "wild" },
  { text: "Never have I ever cried over a text message.", intensity: "wild" },
  { text: "Never have I ever unfollowed someone just to be petty.", intensity: "wild" },
  { text: "Never have I ever cancelled plans and then posted on social media the same night.", intensity: "wild" },
  { text: "Never have I ever lied on my resume and got the job.", intensity: "wild" },
  { text: "Never have I ever eavesdropped on a private conversation on purpose.", intensity: "wild" },
  { text: "Never have I ever faked being sick to avoid someone.", intensity: "wild" },
  { text: "Never have I ever had a friend with benefits situation go horribly wrong.", intensity: "wild" },
  { text: "Never have I ever cried in a public bathroom.", intensity: "wild" },
  { text: "Never have I ever pretended not to see someone in public.", intensity: "wild" },
  { text: "Never have I ever read someone's diary or personal journal.", intensity: "wild" },
  { text: "Never have I ever sent a text to the wrong person and panicked.", intensity: "wild" },
  { text: "Never have I ever Googled myself.", intensity: "wild" },
  { text: "Never have I ever lied about my age.", intensity: "wild" },
  { text: "Never have I ever eaten food that fell on the floor in public.", intensity: "wild" },
  { text: "Never have I ever pretended to know a song I've never heard.", intensity: "wild" },
  { text: "Never have I ever binge-watched an entire series in one day.", intensity: "wild" },
  { text: "Never have I ever waved back at someone who wasn't waving at me.", intensity: "wild" },
  { text: "Never have I ever ghosted someone after three or more dates.", intensity: "wild" },
  { text: "Never have I ever laughed at something I shouldn't have.", intensity: "wild" },
  { text: "Never have I ever snuck out of the house at night.", intensity: "wild" },
  { text: "Never have I ever made up a story to avoid going to an event.", intensity: "wild" },
  { text: "Never have I ever used 'read receipts' as a power move.", intensity: "wild" },
  // ── Indian/Desi-specific WILD ──
  { text: "Never have I ever lied to my parents about where I was going.", intensity: "wild" },
  { text: "Never have I ever secretly eaten non-veg when I told everyone I'm veg.", intensity: "wild" },
  { text: "Never have I ever used a relative's Netflix/Hotstar/Prime account without telling them.", intensity: "wild" },
  { text: "Never have I ever pretended to be studying when I was just on my phone.", intensity: "wild" },
  { text: "Never have I ever blamed a sibling for something I did.", intensity: "wild" },
  { text: "Never have I ever hidden a purchase from family to avoid questions.", intensity: "wild" },
  { text: "Never have I ever told my parents I got higher marks than I actually did.", intensity: "wild" },
  { text: "Never have I ever snuck food into a movie theatre.", intensity: "wild" },
  { text: "Never have I ever used someone else's metro card without permission.", intensity: "wild" },
  { text: "Never have I ever been caught sleeping in class.", intensity: "wild" },

  // ── SPICY — 18+, hookups, NSFW, relationships ──
  { text: "Never have I ever hooked up with someone I met that same night.", intensity: "spicy" },
  { text: "Never have I ever sent a nude.", intensity: "spicy" },
  { text: "Never have I ever received a nude from someone in this room.", intensity: "spicy" },
  { text: "Never have I ever had a one night stand.", intensity: "spicy" },
  { text: "Never have I ever faked an orgasm.", intensity: "spicy" },
  { text: "Never have I ever hooked up with someone my friend had a thing with.", intensity: "spicy" },
  { text: "Never have I ever been caught watching something I shouldn't have.", intensity: "spicy" },
  { text: "Never have I ever had a hookup I was too embarrassed to tell anyone about.", intensity: "spicy" },
  { text: "Never have I ever used a dating app while in a relationship.", intensity: "spicy" },
  { text: "Never have I ever done it in a public place.", intensity: "spicy" },
  { text: "Never have I ever sexted someone I shouldn't have.", intensity: "spicy" },
  { text: "Never have I ever had a friends-with-benefits relationship.", intensity: "spicy" },
  { text: "Never have I ever done a walk of shame.", intensity: "spicy" },
  { text: "Never have I ever fantasized about someone in this room.", intensity: "spicy" },
  { text: "Never have I ever hooked up with an ex after breaking up.", intensity: "spicy" },
  { text: "Never have I ever lied about my body count.", intensity: "spicy" },
  { text: "Never have I ever been the other person in someone else's relationship.", intensity: "spicy" },
  { text: "Never have I ever had a dream about someone in this room that I wouldn't share.", intensity: "spicy" },
  { text: "Never have I ever sent a spicy text to the wrong person.", intensity: "spicy" },
  { text: "Never have I ever had a crush on someone way older than me.", intensity: "spicy" },
  { text: "Never have I ever made out with a stranger at a party.", intensity: "spicy" },
  { text: "Never have I ever gone commando on purpose to feel something.", intensity: "spicy" },
  { text: "Never have I ever been caught making out somewhere I shouldn't have been.", intensity: "spicy" },
  { text: "Never have I ever had a hookup and forgotten their name the next morning.", intensity: "spicy" },
  { text: "Never have I ever used someone's Netflix password after we stopped seeing each other.", intensity: "spicy" },
  { text: "Never have I ever stalked my hookup's Instagram before meeting them.", intensity: "spicy" },
  { text: "Never have I ever kissed more than 3 people in one night.", intensity: "spicy" },
  { text: "Never have I ever left someone's place in the middle of the night without saying bye.", intensity: "spicy" },
  { text: "Never have I ever hooked up at a wedding.", intensity: "spicy" },
  { text: "Never have I ever received a dirty DM from someone unexpected.", intensity: "spicy" },
  { text: "Never have I ever developed feelings for someone I was only supposed to hook up with.", intensity: "spicy" },
  { text: "Never have I ever been on a date that ended way better than expected.", intensity: "spicy" },
  { text: "Never have I ever had a secret relationship that lasted more than 3 months.", intensity: "spicy" },
  { text: "Never have I ever been attracted to someone I'm not supposed to be attracted to.", intensity: "spicy" },
  { text: "Never have I ever matched with someone I know on a dating app.", intensity: "spicy" },
  { text: "Never have I ever kissed someone of the same gender.", intensity: "spicy" },
  { text: "Never have I ever used alcohol as liquid courage to confess something.", intensity: "spicy" },
  { text: "Never have I ever been someone's rebound.", intensity: "spicy" },
  { text: "Never have I ever accidentally liked a very old photo while stalking someone.", intensity: "spicy" },
  // ── Indian/Desi-specific SPICY ──
  { text: "Never have I ever had a crush on a cousin's friend at a family wedding.", intensity: "spicy" },
  { text: "Never have I ever texted someone from a 'secret' number or second SIM.", intensity: "spicy" },
  { text: "Never have I ever had a relationship my parents still don't know about.", intensity: "spicy" },
  { text: "Never have I ever skipped a family function for a date.", intensity: "spicy" },

  // ── CHAOS — absolutely unhinged, friendship-ending, no mercy ──
  { text: "Never have I ever cheated on someone.", intensity: "chaos" },
  { text: "Never have I ever been the reason someone broke up.", intensity: "chaos" },
  { text: "Never have I ever hooked up with two people in the same day.", intensity: "chaos" },
  { text: "Never have I ever done something so embarrassing drunk that I had to leave town.", intensity: "chaos" },
  { text: "Never have I ever had a secret relationship nobody knew about.", intensity: "chaos" },
  { text: "Never have I ever been arrested or spent a night at the police station.", intensity: "chaos" },
  { text: "Never have I ever lied to everyone in this room about the same thing.", intensity: "chaos" },
  { text: "Never have I ever done something illegal and still don't regret it.", intensity: "chaos" },
  { text: "Never have I ever ruined someone's relationship on purpose.", intensity: "chaos" },
  { text: "Never have I ever been blackmailed with something embarrassing.", intensity: "chaos" },
  { text: "Never have I ever done a dare so bad it's now a core memory.", intensity: "chaos" },
  { text: "Never have I ever hooked up with someone to get over someone else.", intensity: "chaos" },
  { text: "Never have I ever had a secret that would change how everyone here sees me.", intensity: "chaos" },
  { text: "Never have I ever blamed someone else for something I did and they got in trouble.", intensity: "chaos" },
  { text: "Never have I ever done something that would make my parents disown me if they knew.", intensity: "chaos" },
  { text: "Never have I ever had evidence of something that could ruin someone in this room.", intensity: "chaos" },
  { text: "Never have I ever helped someone cheat and kept it secret.", intensity: "chaos" },
  { text: "Never have I ever slept with someone for personal gain.", intensity: "chaos" },
  { text: "Never have I ever had a whole double life that nobody here knows about.", intensity: "chaos" },
  { text: "Never have I ever catfished someone.", intensity: "chaos" },
  { text: "Never have I ever made up a lie so big that I had to keep it going for months.", intensity: "chaos" },
  { text: "Never have I ever gotten someone fired or expelled on purpose.", intensity: "chaos" },
  { text: "Never have I ever had nudes leaked or threatened to be leaked.", intensity: "chaos" },
  { text: "Never have I ever woken up in a place with zero memory of how I got there.", intensity: "chaos" },
  { text: "Never have I ever done something at a party that got the cops called.", intensity: "chaos" },
  { text: "Never have I ever hooked up with someone I work with and kept it completely secret.", intensity: "chaos" },
  { text: "Never have I ever had a situationship that ended messier than any real relationship.", intensity: "chaos" },
  { text: "Never have I ever blocked someone and then unblocked them three or more times.", intensity: "chaos" },
  { text: "Never have I ever pretended to be single while in a relationship.", intensity: "chaos" },
  { text: "Never have I ever sent the same exact text to multiple people at once.", intensity: "chaos" },
  { text: "Never have I ever let someone take the blame for a situation I created.", intensity: "chaos" },
  { text: "Never have I ever had feelings for my best friend's partner.", intensity: "chaos" },
  { text: "Never have I ever gotten into a physical fight over someone I was seeing.", intensity: "chaos" },
  { text: "Never have I ever done something in this city that I could never tell anyone about.", intensity: "chaos" },
  // ── Indian/Desi-specific CHAOS ──
  { text: "Never have I ever had a secret that, if my parents found out, would lead to a family emergency meeting.", intensity: "chaos" },
  { text: "Never have I ever been the 'good child' in front of family while doing the complete opposite outside.", intensity: "chaos" },
  { text: "Never have I ever convinced my family I had an official event while I was actually somewhere wild.", intensity: "chaos" },
];

export type NHIEIntensity = "wild" | "spicy" | "chaos";

export function getPromptsByIntensity(intensity: NHIEIntensity): NeverHaveIEverPrompt[] {
  const levels: NHIEIntensity[] =
    intensity === "wild" ? ["wild"] :
    intensity === "spicy" ? ["wild", "spicy"] :
    ["wild", "spicy", "chaos"];
  return prompts.filter((p) => levels.includes(p.intensity));
}

export function shufflePrompts(
  pool: NeverHaveIEverPrompt[],
  randomFn: () => number = Math.random
): NeverHaveIEverPrompt[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
