import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Style Guide',
  description: `Style guide for ${SITE_NAME} -- formatting and writing standards.`,
};

export default function StyleGuidePage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Style Guide</div>
          <div className="page-hd-sub">Formatting and writing standards for CrimsonWiki</div>
        </div>
      </div>

      {/* STYLE GUIDE CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Article Naming Conventions</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Consistent article naming helps users find information and maintains a professional appearance:
              </p>
              
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                General Rules
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Use Full Names:</strong> Use complete, official names rather than abbreviations
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Capitalize Properly:</strong> Use title case for article titles (Major Words Capitalized)
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>No Special Characters:</strong> Avoid symbols, emojis, or excessive punctuation
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Specific:</strong> Include enough detail to distinguish similar topics
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Use English:</strong> All article titles should be in English
                </li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Examples
              </h3>
              <div style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--amber)' }}>Good:</strong> "Kliff Character Guide", "Steel Sword Crafting Recipe"
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--amber)' }}>Good:</strong> "Hernand Region Overview", "World Boss Strategies"
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'crimson' }}>Avoid:</strong> "kliff", "sword recipe", "bosses!!!"
                </p>
                <p>
                  <strong style={{ color: 'crimson' }}>Avoid:</strong> "🗡️ Sword", "??? Guide", "Tips & Tricks"
                </p>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Infobox Usage Guidelines</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Infoboxes provide quick, structured information about articles. Use them consistently:
              </p>
              
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                When to Use Infoboxes
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Characters:</strong> Always use for character articles
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Items:</strong> Use for weapons, armor, and important items
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Locations:</strong> Use for regions, dungeons, and major areas
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Quests:</strong> Use for main story and important side quests
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Bosses:</strong> Always use for boss articles
                </li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Infobox Content Standards
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Keep it Relevant:</strong> Only include important, factual information
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Consistent:</strong> Use the same field names across similar articles
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Avoid Speculation:</strong> Only include verified information
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Use Proper Formatting:</strong> Numbers should be consistent (e.g., "1,250" not "1250")
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Update Regularly:</strong> Keep infobox information current with game updates
                </li>
              </ul>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Category Assignment Rules</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Proper categorization helps users navigate the wiki and discover related content:
              </p>
              
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Category Selection Guidelines
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Primary Category:</strong> Choose the most relevant main category
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Specific:</strong> Use the most specific category available
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Avoid Over-categorization:</strong> Don't force articles into inappropriate categories
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Check Similar Articles:</strong> See how similar content is categorized
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Ask When Unsure:</strong> Use talk pages to discuss categorization questions
                </li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Category Mappings
              </h3>
              <div style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Characters:</strong> Use "Lore" category for story characters
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Combat Guides:</strong> Use "Classes" for build-related content
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Recipe Content:</strong> Use "Crafting" for crafting guides
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Walkthroughs:</strong> Use "Quests" for quest-related content
                </p>
                <p>
                  <strong style={{ color: 'var(--text-0)' }}>General Tips:</strong> Use "Tips" for general advice and strategies
                </p>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Heading Structure</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Proper heading structure creates well-organized, readable articles:
              </p>
              
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Heading Hierarchy
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>H1:</strong> Article title (automatic, don't use in content)
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>H2:</strong> Main sections (use for major topics)
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>H3:</strong> Subsections (use for subtopics within H2 sections)
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>H4:</strong> Minor subdivisions (use sparingly)
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>H5/H6:</strong> Rarely needed, avoid if possible
                </li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Heading Guidelines
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Don't Skip Levels:</strong> Don't jump from H2 to H4
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Descriptive:</strong> Headings should clearly indicate content
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Keep it Brief:</strong> Use concise, informative headings
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Use Title Case:</strong> Capitalize Major Words in Headings
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>No Formatting:</strong> Keep headings plain text (no bold, italic, etc.)
                </li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Example Structure
              </h3>
              <div style={{ marginLeft: '20px', fontFamily: 'var(--ff-mono)', fontSize: '12px', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '8px' }}>Article Title (H1 - automatic)</p>
                <p style={{ marginBottom: '8px', paddingLeft: '16px' }}>== Overview == (H2)</p>
                <p style={{ marginBottom: '8px', paddingLeft: '32px' }}>=== Background === (H3)</p>
                <p style={{ marginBottom: '8px', paddingLeft: '32px' }}>=== Key Features === (H3)</p>
                <p style={{ marginBottom: '8px', paddingLeft: '16px' }}>== Gameplay == (H2)</p>
                <p style={{ marginBottom: '8px', paddingLeft: '32px' }}>=== Combat === (H3)</p>
                <p style={{ marginBottom: '8px', paddingLeft: '32px' }}>=== Progression === (H3)</p>
                <p style={{ marginBottom: '8px', paddingLeft: '16px' }}>== Strategy == (H2)</p>
                <p style={{ paddingLeft: '32px' }}>=== Tips === (H3)</p>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Writing Tone and Style</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Maintain a consistent, professional tone throughout the wiki:
              </p>
              
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Tone Guidelines
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Encyclopedic:</strong> Write like a reference, not a conversation
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Neutral:</strong> Avoid personal opinions and bias
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Present Tense:</strong> Use present tense for game mechanics and facts
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Professional:</strong> Avoid slang, memes, or overly casual language
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Helpful:</strong> Write to inform and assist readers
                </li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Writing Examples
              </h3>
              <div style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--amber)' }}>Good:</strong> "The Steel Sword requires 10 Iron Ore and 5 Leather to craft."
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--amber)' }}>Good:</strong> "Kliff serves as the main protagonist and guides players through early game content."
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'crimson' }}>Avoid:</strong> "I think the Steel Sword is pretty OP and you should totally craft it!"
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'crimson' }}>Avoid:</strong> "Kliff was like, super cool and helped me out lol"
                </p>
                <p>
                  <strong style={{ color: 'crimson' }}>Avoid:</strong> "You'll want to grind this quest because it's basically required..."
                </p>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Image Guidelines</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Images enhance articles but must follow specific guidelines:
              </p>
              
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Image Requirements
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Screenshots Only:</strong> Use in-game screenshots you take yourself
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>No Copyrighted Material:</strong> Don't use official art, promotional images, or concept art
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>High Quality:</strong> Use clear, well-composed screenshots
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Relevant Content:</strong> Images should directly relate to the article content
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Proper Sizing:</strong> Optimize images for web display (not too large, not too small)
                </li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                Image Usage Guidelines
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Add Alt Text:</strong> Always describe what the image shows
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Provide Context:</strong> Explain why the image is included
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Avoid Spoilers:</strong> Mark images that reveal major story elements
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Use Sparingly:</strong> Don't overwhelm articles with too many images
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Consistent Style:</strong> Use similar image styles throughout related articles
                </li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                What to Avoid
              </h3>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'crimson' }}>Official Artwork:</strong> No concept art, promotional images, or official renders
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'crimson' }}>Watermarked Images:</strong> Don't use images with other sites' watermarks
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'crimson' }}>Low Quality Screenshots:</strong> Avoid blurry, compressed, or poorly framed images
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'crimson' }}>Irrelevant Images:</strong> Don't add images just for decoration
                </li>
                <li>
                  <strong style={{ color: 'crimson' }}>Personal Screenshots:</strong> Don't include UI elements, character names, or personal content
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Reference</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Titles:</strong> Title Case, Full Names
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Headings:</strong> H2 main, H3 sub
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Tone:</strong> Neutral, encyclopedic
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Images:</strong> Screenshots only
              </p>
              <p>
                <strong>Categories:</strong> Be specific
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Related Guides</div>
            <div className="wiki-box-body">
              <Link href="/help/editing" className="sidebar-link">Editing Guide</Link>
              <Link href="/contribute" className="sidebar-link">Contribution Guide</Link>
              <Link href="/community" className="sidebar-link">Community Guidelines</Link>
              <Link href="/about" className="sidebar-link">About CrimsonWiki</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Need Help?</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Questions?</strong> Ask on talk pages.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Unsure?</strong> Check similar articles.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Discussion?</strong> Use community forums.
              </p>
              <Link href="/community" className="sidebar-link">Get Community Help</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
