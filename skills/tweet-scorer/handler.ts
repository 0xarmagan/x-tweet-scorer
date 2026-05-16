/**
 * Tweet Scorer Claude Code Skill Handler
 *
 * Provides /tweet-score command for analyzing tweets using X's official algorithm.
 * Supports both quick mode (/tweet-score "text") and interactive mode (/tweet-score)
 */

import { execSync } from 'child_process';
import * as readline from 'readline';

// Types
interface AnalysisResult {
  overall_score: number;
  simple_recommendations: string[];
  reasoning: string;
  signals?: {
    like_potential: number;
    reply_potential: number;
    repost_potential: number;
    quote_potential?: number;
    share_potential?: number;
    click_potential: number;
    profile_click_potential: number;
    video_potential: number;
    dwell_time_potential: number;
    follow_potential: number;
    bookmark_potential: number;
    photo_engagement: number;
  };
  negative_signals?: {
    not_interested_risk: number;
    mute_risk: number;
    block_risk: number;
  };
  sequence_analysis?: {
    engagement_pattern: 'viral' | 'decay' | 'niche_amplification';
    dwell_time_prediction: string;
    trend_alignment: string;
  };
}

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

// Score tier classification
function getTier(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'EXCELLENT', color: colors.green };
  if (score >= 65) return { label: 'GOOD', color: colors.blue };
  if (score >= 45) return { label: 'NEEDS WORK', color: colors.yellow };
  return { label: 'AT RISK', color: colors.red };
}

// Format score visualization
function visualizeScore(score: number): string {
  const filled = Math.floor(score / 10);
  const empty = 10 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const tier = getTier(score);
  return `${tier.color}${bar}${colors.reset} ${score}/100 [${tier.label}]`;
}

// Call the analyzer API
async function analyzetweet(tweet: string, mode: 'simple' | 'detailed' = 'simple'): Promise<AnalysisResult> {
  try {
    // Determine if running locally or via API
    const provider = process.env.LLM_PROVIDER || 'ollama';
    const apiUrl = process.env.TWEET_SCORER_API || 'http://localhost:3000/api/analyze';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tweet_text: tweet,
        mode: mode,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`${colors.red}Error analyzing tweet:${colors.reset}`, error);
    throw error;
  }
}

// Format and display analysis results
function displayAnalysis(analysis: AnalysisResult, detailed: boolean = false): string {
  const tier = getTier(analysis.overall_score);
  let output = '';

  // Header
  output += `\n${colors.bright}═══════════════════════════════════════${colors.reset}\n`;
  output += `${colors.bright}ENGAGEMENT SCORE: ${analysis.overall_score}/100${colors.reset}\n`;
  output += `${tier.color}${tier.label}${colors.reset}\n`;
  output += `${colors.bright}═══════════════════════════════════════${colors.reset}\n\n`;

  // Reasoning
  output += `${colors.blue}💡 Analysis:${colors.reset}\n${analysis.reasoning}\n\n`;

  // Signal breakdown (if available)
  if (analysis.signals && detailed) {
    output += `${colors.bright}📊 ENGAGEMENT SIGNALS (15 Official Weights)${colors.reset}\n`;
    output += `${colors.bright}Retweet (×20):${colors.reset} ${analysis.signals.repost_potential}/100 - `;
    output += analysis.signals.repost_potential >= 80 ? '✅ HIGH' : analysis.signals.repost_potential >= 65 ? '⚠️ MEDIUM' : '❌ LOW';
    output += '\n';
    output += `${colors.bright}Quote (×18):${colors.reset} ${analysis.signals.quote_potential || 'N/A'}/100\n`;
    output += `${colors.bright}Reply (×13.5):${colors.reset} ${analysis.signals.reply_potential}/100\n`;
    output += `${colors.bright}Share (×15):${colors.reset} ${analysis.signals.share_potential || 'N/A'}/100\n`;
    output += `${colors.bright}Video (×14):${colors.reset} ${analysis.signals.video_potential}/100\n`;
    output += `${colors.bright}Dwell Time (×6):${colors.reset} ${analysis.signals.dwell_time_potential}/100\n`;
    output += `${colors.bright}Bookmarks (×10):${colors.reset} ${analysis.signals.bookmark_potential}/100\n\n`;
  }

  // Engagement pattern (if available)
  if (analysis.sequence_analysis) {
    output += `${colors.bright}📈 Engagement Sequence:${colors.reset}\n`;
    output += `Pattern: ${analysis.sequence_analysis.engagement_pattern}\n`;
    output += `Dwell Time: ${analysis.sequence_analysis.dwell_time_prediction}\n`;
    output += `Trend Alignment: ${analysis.sequence_analysis.trend_alignment}\n\n`;
  }

  // Recommendations
  output += `${colors.bright}✅ Recommendations:${colors.reset}\n`;
  analysis.simple_recommendations.forEach((rec, i) => {
    output += `${i + 1}. ${rec}\n`;
  });

  output += '\n';
  return output;
}

// Quick mode: /tweet-score "text"
async function quickAnalyze(tweet: string): Promise<void> {
  console.log(`\n${colors.blue}Analyzing tweet...${colors.reset}\n`);

  try {
    const analysis = await analyzetweet(tweet, 'simple');
    console.log(displayAnalysis(analysis, false));
  } catch (error) {
    console.error(`${colors.red}Failed to analyze tweet${colors.reset}`);
  }
}

// Interactive mode: /tweet-score
async function interactiveAnalyze(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  try {
    console.log(`\n${colors.bright}Tweet Scorer - Interactive Mode${colors.reset}`);
    console.log(`${colors.blue}Powered by X's official algorithm${colors.reset}\n`);

    // Get tweet
    const tweet = await question(
      `${colors.bright}📝 Paste your tweet (or describe it):${colors.reset}\n> `
    );

    if (!tweet.trim()) {
      console.log(`${colors.red}No tweet provided. Exiting.${colors.reset}`);
      rl.close();
      return;
    }

    // Analyze
    console.log(`\n${colors.blue}Analyzing...${colors.reset}\n`);
    const analysis = await analyzeTweet(tweet, 'detailed');
    console.log(displayAnalysis(analysis, true));

    // Interactive options
    let continueSession = true;
    while (continueSession) {
      const choice = await question(
        `${colors.bright}What next?${colors.reset}\n` +
        `[D] Detailed breakdown | [S] Score explanation | [V] Variations | [N] New tweet | [Q] Quit\n> `
      );

      switch (choice.toLowerCase()) {
        case 'd':
          console.log(`\n${colors.bright}Detailed Breakdown:${colors.reset}\n`);
          console.log(displayAnalysis(analysis, true));
          break;

        case 's':
          console.log(`\n${colors.bright}Score Explanation:${colors.reset}`);
          console.log(analysis.reasoning);
          break;

        case 'v':
          console.log(
            `\n${colors.blue}Generating variations...${colors.reset}\n`
          );
          // Re-analyze with variation prompts
          const variations = [
            `Make this more specific and data-backed: "${tweet}"`,
            `Rewrite as a question: "${tweet}"`,
            `Add emotional hook: "${tweet}"`,
          ];

          for (const variation of variations) {
            const varAnalysis = await analyzetweet(variation, 'simple');
            const improvement = varAnalysis.overall_score - analysis.overall_score;
            console.log(
              `${colors.bright}Variation (${improvement > 0 ? '+' : ''}${improvement}):${colors.reset}`
            );
            console.log(`${variation.substring(0, 60)}...\n`);
          }
          break;

        case 'n':
          const newTweet = await question(`\n${colors.bright}New tweet:${colors.reset}\n> `);
          if (newTweet.trim()) {
            console.log(`\n${colors.blue}Analyzing...${colors.reset}\n`);
            const newAnalysis = await analyzetweet(newTweet, 'detailed');
            console.log(displayAnalysis(newAnalysis, true));
          }
          break;

        case 'q':
          continueSession = false;
          break;

        default:
          console.log(`${colors.red}Unknown option${colors.reset}`);
      }
    }

    console.log(`\n${colors.green}Thanks for using Tweet Scorer!${colors.reset}\n`);
    rl.close();
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error);
    rl.close();
  }
}

// Main skill handler
export async function handleTweetScorer(args: string[]): Promise<void> {
  if (args.length > 0 && args[0].startsWith('"')) {
    // Quick mode: /tweet-score "text"
    const tweet = args.join(' ').replace(/^"(.*)"$/, '$1');
    await quickAnalyze(tweet);
  } else if (args.length > 0 && args[0] === '--detail') {
    // Detailed mode: /tweet-score-detail "text"
    const tweet = args.slice(1).join(' ').replace(/^"(.*)"$/, '$1');
    const analysis = await analyzetweet(tweet, 'detailed');
    console.log(displayAnalysis(analysis, true));
  } else {
    // Interactive mode: /tweet-score
    await interactiveAnalyze();
  }
}

// Export for CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  handleTweetScorer(args).catch((error) => {
    console.error(`${colors.red}Error:${colors.reset}`, error);
    process.exit(1);
  });
}
