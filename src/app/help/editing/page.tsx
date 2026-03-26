import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Editing Guide',
  description: `Learn how to edit articles on ${SITE_NAME} -- comprehensive editing guide.`,
};

export default function EditingGuidePage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Editing Guide</div>
          <div className="page-hd-sub">Learn how to create and edit wiki articles</div>
        </div>
      </div>

      {/* EDITING GUIDE CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Getting Started with Editing</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Welcome to the CrimsonWiki editing guide! This comprehensive guide will teach you everything
                you need to know to create and edit high-quality wiki articles.
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px', marginTop: '24px' }}>
                Prerequisites
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Before you can edit articles, you'll need to:
              </p>
              <ol style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Create an Account</strong> - Sign in with Discord to get editing privileges
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Read the Style Guide</strong> - Understand our formatting and writing standards
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Start Small</strong> - Begin with minor edits before tackling large articles
                </li>
              </ol>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">How to Create an Article (Step by Step)</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Step 1: Plan Your Article
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Before creating a new article, consider:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Does this topic already exist? (Search first!)</li>
                <li style={{ marginBottom: '8px' }}>Is this topic relevant to Crimson Desert?</li>
                <li style={{ marginBottom: '8px' }}>Do you have enough information to write a comprehensive article?</li>
                <li>Which category does this article belong to?</li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Step 2: Create the Article
              </h3>
              <p style={{ marginBottom: '16px' }}>
                To create a new article:
              </p>
              <ol style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  Navigate to <Link href="/wiki/new" style={{ color: 'var(--link)' }}>Create New Article</Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Enter a descriptive title (use full names, capitalize properly)
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Choose the appropriate category
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Write your content using the rich text editor
                </li>
                <li>
                  Add an edit summary explaining your changes
                </li>
              </ol>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Step 3: Review and Publish
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Before publishing:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Proofread for spelling and grammar errors</li>
                <li style={{ marginBottom: '8px' }}>Check all facts and information</li>
                <li style={{ marginBottom: '8px' }}>Ensure proper formatting and structure</li>
                <li style={{ marginBottom: '8px' }}>Add relevant categories</li>
                <li>Preview the article to check appearance</li>
              </ul>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Using the Rich Text Editor</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Basic Formatting
              </h3>
              <p style={{ marginBottom: '16px' }}>
                The editor provides buttons for common formatting:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Bold Text:</strong> Use for emphasis and key terms
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Italic Text:</strong> Use for titles, foreign words, or subtle emphasis
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Headings:</strong> Use H2 for main sections, H3 for subsections
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Lists:</strong> Use bullet points for itemized lists, numbered for steps
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Links:</strong> Link to other wiki articles and external sources
                </li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Advanced Features
              </h3>
              <p style={{ marginBottom: '16px' }}>
                The editor also supports:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Tables:</strong> For organized data and comparisons
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Images:</strong> Upload and insert screenshots
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Code Blocks:</strong> For technical information or data
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Blockquotes:</strong> For quotes or important notes
                </li>
              </ul>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Adding Categories</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Categories help organize the wiki and make articles easier to discover:
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Available Categories
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Quests:</strong> Main story, side quests, hidden quests
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Bosses:</strong> World bosses, dungeon bosses, field bosses
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Items:</strong> Weapons, armor, consumables, materials
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Locations:</strong> Regions, dungeons, towns, points of interest
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Classes:</strong> Playable classes, skills, builds
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Crafting:</strong> Recipes, materials, crafting guides
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Tips:</strong> Community tips, hidden mechanics, beginner guides
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Lore:</strong> Story, world lore, characters, factions
                </li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Category Guidelines
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Choose the most appropriate primary category</li>
                <li style={{ marginBottom: '8px' }}>Some articles may fit multiple categories - use your best judgment</li>
                <li style={{ marginBottom: '8px' }}>If unsure, ask for guidance on the article's talk page</li>
                <li>Categories can be changed later if needed</li>
              </ul>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Uploading Images</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Image Guidelines
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Use Screenshots Only:</strong> Take your own screenshots from the game
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>No Copyrighted Material:</strong> Don't use promotional art, concept art, or official images
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Keep it Relevant:</strong> Only include images that add value to the article
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Optimize Size:</strong> Keep images reasonably sized for fast loading
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Provide Context:</strong> Explain what each image shows
                </li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                How to Upload
              </h3>
              <ol style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Click the image button in the editor</li>
                <li style={{ marginBottom: '8px' }}>Select "Upload Image" option</li>
                <li style={{ marginBottom: '8px' }}>Choose your screenshot file</li>
                <li style={{ marginBottom: '8px' }}>Wait for the upload to complete</li>
                <li>Add alt text describing the image</li>
              </ol>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Edit Summary Guidelines</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Edit summaries help other editors understand your changes. Always provide a clear, concise summary:
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Good Edit Summaries
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Added boss mechanics and drop rates</li>
                <li style={{ marginBottom: '8px' }}>Fixed outdated quest requirements</li>
                <li style={{ marginBottom: '8px' }}>Added crafting recipe for Steel Sword</li>
                <li style={{ marginBottom: '8px' }}>Updated item stats for patch 1.2</li>
                <li>Expanded lore section with new information</li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Poor Edit Summaries
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>update (too vague)</li>
                <li style={{ marginBottom: '8px' }}>fixed stuff (unclear)</li>
                <li style={{ marginBottom: '8px' }}>edit (obvious)</li>
                <li>Leaving it empty (always provide a summary)</li>
              </ul>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">What NOT to Do</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Content Restrictions
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>No Copyrighted Content:</strong> Don't copy-paste from other wikis, guides, or official sources
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>No Speculation:</strong> Stick to verified information, mark theories as such
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>No Personal Opinions:</strong> Maintain neutral, encyclopedic tone
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>No Spoilers Without Warning:</strong> Mark major story spoilers clearly
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>No Vandalism:</strong> Don't deliberately destroy or damage content
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>No Spam:</strong> Don't add irrelevant links or promotional content
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>No Harassment:</strong> Don't target other users or create hostile content
                </li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Editing Etiquette
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Assume good faith from other editors</li>
                <li style={{ marginBottom: '8px' }}>Discuss major changes on talk pages first</li>
                <li style={{ marginBottom: '8px' }}>Be bold, but not reckless</li>
                <li style={{ marginBottom: '8px' }}>Respect other contributors' work</li>
                <li>Ask for help when you're unsure</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Actions</div>
            <div className="wiki-box-body">
              <Link href="/wiki/new" className="sidebar-link">Create New Article</Link>
              <Link href="/search" className="sidebar-link">Find Articles to Edit</Link>
              <Link href="/special/recentchanges" className="sidebar-link">Recent Changes</Link>
              <Link href="/community" className="sidebar-link">Community Portal</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Related Guides</div>
            <div className="wiki-box-body">
              <Link href="/help/style" className="sidebar-link">Style Guide</Link>
              <Link href="/contribute" className="sidebar-link">Contribution Guide</Link>
              <Link href="/about" className="sidebar-link">About CrimsonWiki</Link>
              <Link href="/community" className="sidebar-link">Community Guidelines</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Need Help?</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Stuck?</strong> Ask questions on article talk pages.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Unsure?</strong> Start with small edits to learn the system.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Questions?</strong> Join our Discord community.
              </p>
              <Link href="/discord" className="sidebar-link">Get Help on Discord</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
