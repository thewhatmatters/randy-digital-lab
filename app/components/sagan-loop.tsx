import styles from './sagan-loop.module.scss'

// The Sagan loop engraving, lifted verbatim from sagan.run's homepage SVG
// (own asset). Pure vector + currentColor, so it inherits the note's ink
// and flips light/dark with the theme; renders as a Server Component.
export function SaganLoop({
  fig,
  caption,
}: {
  fig?: string
  caption?: string
}) {
  return (
    <figure className={styles.figure}>
      <svg className={styles.engraving} width="504" height="504" viewBox="-44 0 728 728" role="img" aria-labelledby="sagan-loop-t sagan-loop-d">
            <title id="sagan-loop-t">The Sagan loop, drawn as a thin-line engraving</title>
            <desc id="sagan-loop-d">A circular circuit of four stations: ticket plus
                      acceptance criteria, build, critique, and promote gate. A verify
                      satellite exchanges evidence with critique, a REVISE arc curves
                      back, an ESCALATE ray reaches out to a human, and radial lines
                      bind every station to the ledger at the center, in the manner of
                      the Voyager Golden Record cover.</desc>
            <defs>
            <path id="sagan-arw" d="M-9 -3.5 L0 0 L-9 3.5" fill="none" stroke="currentColor" strokeWidth="1"></path>
            </defs>
            <g fill="none" stroke="currentColor">
            <circle cx="310" cy="320" r="252" strokeWidth="1" strokeDasharray="1 11" opacity=".28"></circle>
            <g strokeWidth=".7">
            <circle cx="310" cy="320" r="38" opacity=".9"></circle>
            <circle cx="310" cy="320" r="32" opacity=".75"></circle>
            <circle cx="310" cy="320" r="26" opacity=".6"></circle>
            <circle cx="310" cy="320" r="20" opacity=".5"></circle>
            <circle cx="310" cy="320" r="14" opacity=".4"></circle>
            <circle cx="310" cy="320" r="8" opacity=".35"></circle>
            </g>
            <line x1="310" y1="320" x2="329" y2="287" strokeWidth=".5" opacity=".7"></line>
            <circle cx="310" cy="320" r="1.6" fill="currentColor" stroke="none"></circle>
            <line x1="252" y1="252" x2="283" y2="293" strokeWidth=".4" opacity=".55"></line>
            <text x="247" y="244" textAnchor="end" fontSize="12" className="soft">.SAGAN/LEDGER/</text>
            <text x="247" y="262" textAnchor="end" fontSize="12" className="soft">EVENTS.JSONL</text>
            <g strokeWidth=".6" opacity=".42">
            <g transform="rotate(0,310,320)"><line x1="310" y1="272" x2="310" y2="146"></line></g>
            <g transform="rotate(90,310,320)"><line x1="310" y1="272" x2="310" y2="146"></line></g>
            <g transform="rotate(180,310,320)"><line x1="310" y1="272" x2="310" y2="184"></line></g>
            <g transform="rotate(270,310,320)"><line x1="310" y1="272" x2="310" y2="146"></line></g>
            <g transform="rotate(145,310,320)"><line x1="310" y1="272" x2="310" y2="160"></line></g>
            </g>
            <g strokeWidth=".8" opacity=".55">
            <g transform="rotate(0,310,320)">
            <line x1="305" y1="256" x2="315" y2="256"></line><line x1="305" y1="248" x2="315" y2="248"></line><line x1="305" y1="232" x2="315" y2="232"></line>
            </g>
            <g transform="rotate(90,310,320)">
            <line x1="305" y1="256" x2="315" y2="256"></line><line x1="305" y1="240" x2="315" y2="240"></line><line x1="305" y1="232" x2="315" y2="232"></line><line x1="305" y1="216" x2="315" y2="216"></line>
            </g>
            <g transform="rotate(180,310,320)">
            <line x1="305" y1="248" x2="315" y2="248"></line><line x1="305" y1="224" x2="315" y2="224"></line>
            </g>
            <g transform="rotate(270,310,320)">
            <line x1="305" y1="256" x2="315" y2="256"></line><line x1="305" y1="244" x2="315" y2="244"></line><line x1="305" y1="236" x2="315" y2="236"></line>
            </g>
            <g transform="rotate(145,310,320)">
            <line x1="305" y1="252" x2="315" y2="252"></line><line x1="305" y1="244" x2="315" y2="244"></line><line x1="305" y1="228" x2="315" y2="228"></line><line x1="305" y1="212" x2="315" y2="212"></line>
            </g>
            </g>
            <g strokeWidth="1">
            <path d="M334.4 121.5 A200 200 0 0 1 508.5 295.6"></path>
            <path d="M508.5 344.4 A200 200 0 0 1 334.4 518.5"></path>
            <path d="M285.6 518.5 A200 200 0 0 1 111.5 344.4"></path>
            <path d="M111.5 295.6 A200 200 0 0 1 285.6 121.5"></path>
            </g>
            <use href="#sagan-arw" transform="translate(451.4,178.6) rotate(45)"></use>
            <use href="#sagan-arw" transform="translate(451.4,461.4) rotate(135)"></use>
            <use href="#sagan-arw" transform="translate(168.6,461.4) rotate(225)"></use>
            <use href="#sagan-arw" transform="translate(168.6,178.6) rotate(315)"></use>
            <text x="466" y="163" fontSize="12" className="soft">DISPATCH</text>
            <text x="466" y="486" fontSize="12" className="soft">ARTIFACT @ DIGEST</text>
            <text x="154" y="486" textAnchor="end" fontSize="12" className="soft">APPROVED</text>
            <text x="154" y="163" textAnchor="end" fontSize="12" className="soft">SHIPPED @ SHA</text>
            <path d="M330 505 A170 170 0 0 1 495 340" strokeWidth=".9" strokeDasharray="3 5"></path>
            <use href="#sagan-arw" transform="translate(495,340) rotate(-5)"></use>
            <text x="0" y="0" fontSize="12" className="soft" textAnchor="middle" transform="translate(368,378) rotate(-45)">REVISE</text>
            <g strokeWidth="1">
            <circle cx="310" cy="120" r="13"></circle><circle cx="310" cy="120" r="8.5" strokeWidth=".6" opacity=".7"></circle><circle cx="310" cy="120" r="1.3" fill="currentColor" stroke="none"></circle>
            <circle cx="510" cy="320" r="13"></circle><circle cx="510" cy="320" r="8.5" strokeWidth=".6" opacity=".7"></circle><circle cx="510" cy="320" r="1.3" fill="currentColor" stroke="none"></circle>
            <circle cx="310" cy="520" r="13"></circle><circle cx="310" cy="520" r="8.5" strokeWidth=".6" opacity=".7"></circle><circle cx="310" cy="520" r="1.3" fill="currentColor" stroke="none"></circle>
            <circle cx="110" cy="320" r="13"></circle><circle cx="110" cy="320" r="8.5" strokeWidth=".6" opacity=".7"></circle><circle cx="110" cy="320" r="1.3" fill="currentColor" stroke="none"></circle>
            <circle cx="505" cy="598" r="13"></circle><circle cx="505" cy="598" r="8.5" strokeWidth=".6" opacity=".7"></circle><circle cx="505" cy="598" r="1.3" fill="currentColor" stroke="none"></circle>
            </g>
            <text x="310" y="74" textAnchor="middle" fontSize="14">TICKET + AC</text>
            <text x="310" y="92" textAnchor="middle" fontSize="14" className="soft">WRITTEN BEFORE ANY WORK</text>
            <text x="526" y="311" fontSize="14">BUILD</text>
            <text x="526" y="330" fontSize="14" className="soft">ROLE-BOUND WORKER</text>
            <text x="310" y="478" textAnchor="middle" fontSize="14">CRITIQUE</text>
            <text x="310" y="497" textAnchor="middle" fontSize="14" className="soft">FRESH · ARTIFACT-ONLY</text>
            <text x="88" y="311" textAnchor="end" fontSize="14">PROMOTE GATE</text>
            <text x="88" y="330" textAnchor="end" fontSize="14" className="soft">HUMAN DECISION</text>
            <text x="505" y="627" textAnchor="middle" fontSize="14">VERIFY</text>
            <text x="505" y="646" textAnchor="middle" fontSize="14" className="soft">EXECUTES · NEVER THE BUILDER</text>
            <g strokeWidth=".9">
            <line x1="323.4" y1="529.6" x2="488.6" y2="595.8"></line>
            <line x1="491.6" y1="588.4" x2="326.4" y2="522.2"></line>
            </g>
            <use href="#sagan-arw" transform="translate(488.6,595.8) rotate(21.8) scale(.85)"></use>
            <use href="#sagan-arw" transform="translate(326.4,522.2) rotate(201.8) scale(.85)"></use>
            <text x="0" y="0" fontSize="11" className="soft" textAnchor="middle" transform="translate(418,582) rotate(21.8)">NEEDS_EVIDENCE</text>
            <text x="0" y="0" fontSize="11" className="soft" textAnchor="middle" transform="translate(398,539) rotate(21.8)">EVIDENCE @ SHA</text>
            <line x1="293" y1="536" x2="140" y2="625" strokeWidth=".9"></line>
            <g strokeWidth=".8" opacity=".6">
            <line x1="222" y1="572.5" x2="226" y2="579.5"></line>
            <line x1="206.7" y1="581.5" x2="210.7" y2="588.5"></line>
            <line x1="191.5" y1="590.5" x2="195.5" y2="597.5"></line>
            </g>
            <rect x="128" y="625" width="12" height="12" strokeWidth="1"></rect>
            <text x="134" y="657" textAnchor="middle" fontSize="14">ESCALATE</text>
            <text x="134" y="676" textAnchor="middle" fontSize="14" className="soft">ROUND CAPS &rarr; A HUMAN</text>
            </g>
            </svg>
      {caption && (
        <figcaption className={styles.caption}>
          {fig && <span className={styles.fig}>Fig. {fig}</span>}
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
