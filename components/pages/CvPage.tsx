import React from 'react';
import Head from 'next/head';
import posthog from 'posthog-js';

import { OP, OperatorPage, useReveal } from '~/components/Operator';
import { CV_PROFILES, type CvProfile, type CvTextSegment } from '~/lib/cv';
import { I18nProvider, useI18n } from '~/lib/i18n';

function renderSegments(segments: CvTextSegment[]) {
	return segments.map((segment, index) =>
		segment.strong ? (
			<strong key={index}>{segment.text}</strong>
		) : (
			<React.Fragment key={index}>{segment.text}</React.Fragment>
		),
	);
}

function captureCvClick(target: string) {
	posthog.capture('cv_link_clicked', { target });
}

export function CvPage({ locale = 'pt' }: { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<CvPageInner />
		</I18nProvider>
	);
}

function CvPageInner() {
	const { locale } = useI18n();
	const profile = CV_PROFILES[locale];
	const ref = useReveal({ stagger: 0.04, y: 18 });

	return (
		<OperatorPage
			title={profile.seoTitle}
			description={profile.seoDescription}
			active="/cv"
			socialImage="https://gdantas.com.br/og/default.png"
		>
			<Head>
				<style>{`
					@page { size: A4; margin: 0; }
					@media print {
						html, body { background: #faf9f7 !important; }
						header, footer, .cv-actions { display: none !important; }
						main { max-width: none !important; margin: 0 !important; padding: 0 !important; }
					}
				`}</style>
			</Head>

			<div className="cv-screen" ref={ref}>
				<div className="cv-actions">
					<a
						href={profile.links.pdf.href}
						download
						onClick={() => posthog.capture('cv_pdf_downloaded', { locale })}
						className="cv-action cv-action-primary"
					>
						{profile.actions.downloadPdf}
					</a>
					<a
						href={profile.links.talks.href}
						target="_blank"
						rel="noreferrer noopener"
						onClick={() => captureCvClick('talks')}
						className="cv-action"
					>
						{profile.actions.openTalks}
					</a>
				</div>

				<CvDocument profile={profile} />
			</div>

			<style jsx>{`
				.cv-screen {
					display: grid;
					justify-items: center;
					gap: 18px;
					padding-bottom: 40px;
				}

				.cv-actions {
					width: min(100%, 210mm);
					display: flex;
					justify-content: flex-end;
					gap: 10px;
				}

				.cv-action {
					border: 1px solid ${OP.rule2};
					background: rgba(248, 248, 249, 0.04);
					color: ${OP.fg};
					font-family: ${OP.font};
					font-size: 12px;
					letter-spacing: 0.05em;
					text-decoration: none;
					padding: 8px 12px;
				}

				.cv-action:hover {
					border-color: ${OP.amber};
					color: ${OP.amber};
				}

				.cv-action-primary {
					background: ${OP.amber};
					border-color: ${OP.amber};
					color: #110e1b;
					font-weight: 500;
				}

				.cv-action-primary:hover {
					color: #110e1b;
					filter: brightness(1.05);
				}

				@media (max-width: 640px) {
					.cv-actions {
						justify-content: stretch;
						flex-direction: column;
					}

					.cv-action {
						text-align: center;
					}
				}

				@media print {
					.cv-screen {
						display: block;
						padding: 0;
					}
				}
			`}</style>
		</OperatorPage>
	);
}

function CvDocument({ profile }: { profile: CvProfile }) {
	return (
		<article className="cv-page" aria-label="Gabriel Dantas Gomes CV">
			<div className="cv-head">
				<img className="cv-photo" src="/cv/profile-round.png" alt="Gabriel Dantas Gomes" />
				<div className="cv-identity">
					<h1>
						Gabriel Dantas <span>Gomes</span>
					</h1>
					<div className="cv-title">{profile.title}</div>
					<div className="cv-contacts">
						{profile.contacts.map((contact, index) => (
							<React.Fragment key={contact.href}>
								{index > 0 && <span className="cv-sep">·</span>}
								<a
									href={contact.href}
									target={contact.kind === 'email' ? undefined : '_blank'}
									rel={
										contact.kind === 'email' ? undefined : 'noreferrer noopener'
									}
									onClick={() => captureCvClick(contact.kind)}
								>
									{contact.label}
								</a>
							</React.Fragment>
						))}
					</div>
				</div>
				<div className="cv-qr-wrap">
					<img src="/cv/qr-gdantas.png" alt="QR code gdantas.com.br" />
					<div className="cv-qr-cap">gdantas.com.br</div>
				</div>
			</div>

			<section>
				<div className="cv-sec">{profile.sectionLabels.summary}</div>
				<p className="cv-summary">{renderSegments(profile.summary)}</p>
			</section>

			<section>
				<div className="cv-sec">{profile.sectionLabels.experience}</div>
				{profile.experience.map((company) => (
					<div className="cv-co-block" key={company.name}>
						<div className="cv-co-head">
							<div className="cv-co-name">
								{company.name}
								{company.area && (
									<>
										{' '}
										<span>·</span> {company.area}
									</>
								)}
							</div>
							<div className="cv-co-span">{company.span}</div>
						</div>

						{company.roles.map((role) => (
							<div className="cv-role" key={`${company.name}-${role.title}`}>
								<div className="cv-role-head">
									<div className="cv-role-title">{role.title}</div>
									<div className="cv-role-meta">{role.meta}</div>
								</div>
								{role.items && (
									<ul>
										{role.items.map((item, index) => (
											<li key={index}>{renderSegments(item)}</li>
										))}
									</ul>
								)}
								{role.line && <p className="cv-one-line">{role.line}</p>}
							</div>
						))}
					</div>
				))}
			</section>

			<section>
				<div className="cv-sec">
					{profile.sectionLabels.talks}{' '}
					<a
						href={profile.links.talks.href}
						target="_blank"
						rel="noreferrer noopener"
						onClick={() => captureCvClick('talks-section')}
					>
						↗
					</a>
				</div>
				<div className="cv-talks">
					{profile.talks.map((talk) => (
						<div className="cv-talk" key={`${talk.date}-${talk.title}`}>
							<div className="cv-talk-date">{talk.date}</div>
							<div className="cv-talk-body">
								<span className="cv-talk-title">{talk.title}</span>
								<br />
								<span className="cv-talk-event">{talk.event}</span>
							</div>
						</div>
					))}
				</div>
			</section>

			<div className="cv-bottom">
				<section>
					<div className="cv-sec">{profile.sectionLabels.education}</div>
					{profile.education.map((edu) => (
						<div className="cv-edu" key={`${edu.school}-${edu.degree}`}>
							<div className="cv-deg">
								{edu.degree}
								{edu.badge && <span className="cv-badge">{edu.badge}</span>}
							</div>
							<div className="cv-sch">{edu.school}</div>
							<div className="cv-when">{edu.when}</div>
						</div>
					))}
				</section>

				<section>
					<div className="cv-sec">{profile.sectionLabels.stack}</div>
					{profile.skills.map((skill) => (
						<div className="cv-skill-row" key={skill.label}>
							<div className="cv-lab">{skill.label}</div>
							<div className="cv-vals">{skill.values}</div>
						</div>
					))}
					<div className="cv-creds">
						<strong>{profile.sectionLabels.credentials}:</strong> {profile.credentials}
						<br />
						<strong>{profile.sectionLabels.languages}:</strong> {profile.languages}
					</div>
				</section>
			</div>

			<div className="cv-footer">
				<div>{profile.footerLeft}</div>
				<div>{profile.footerRight}</div>
			</div>

			<style jsx>{`
				.cv-page {
					--paper: #faf9f7;
					--ink: #0e0f10;
					--muted: #5a5660;
					--dim: #8a8690;
					--line: #e8e4ea;
					--magenta: #ed145b;
					--magenta-soft: #fde8ef;
					--accent-text: #d41252;

					width: min(100%, 210mm);
					min-height: 297mm;
					background: var(--paper);
					color: var(--ink);
					box-shadow: 0 18px 60px rgba(0, 0, 0, 0.22);
					padding: 8.5mm 11mm 7.5mm;
					box-sizing: border-box;
					overflow: hidden;
					font-family: Inter, ${OP.sans};
					font-size: 8.8pt;
					line-height: 1.38;
					-webkit-print-color-adjust: exact;
					print-color-adjust: exact;
				}

				.cv-page :global(*) {
					box-sizing: border-box;
				}

				.cv-head {
					display: grid;
					grid-template-columns: 18mm 1fr 22mm;
					gap: 10px;
					align-items: center;
					padding-bottom: 7px;
					border-bottom: 1.5px solid var(--ink);
					margin-bottom: 7px;
				}

				.cv-photo {
					width: 18mm;
					height: 18mm;
					border-radius: 50%;
					object-fit: cover;
					border: 2px solid var(--magenta);
					background: var(--line);
				}

				.cv-identity h1 {
					font-size: 17pt;
					font-weight: 700;
					letter-spacing: -0.035em;
					line-height: 1.05;
					margin: 0;
				}

				.cv-identity h1 span {
					color: var(--magenta);
				}

				.cv-title {
					margin-top: 2px;
					font-size: 8.4pt;
					font-weight: 500;
					color: var(--muted);
				}

				.cv-contacts {
					margin-top: 5px;
					display: flex;
					flex-wrap: wrap;
					gap: 2px 10px;
					font-family: ${OP.font};
					font-size: 6.2pt;
					color: var(--muted);
				}

				.cv-contacts a,
				.cv-sec a {
					color: var(--ink);
					text-decoration: none;
				}

				.cv-sec a {
					color: var(--accent-text);
				}

				.cv-sep {
					color: var(--dim);
				}

				.cv-qr-wrap {
					text-align: center;
					justify-self: end;
				}

				.cv-qr-wrap img {
					width: 20mm;
					height: 20mm;
					display: block;
					margin: 0 auto;
				}

				.cv-qr-cap {
					margin-top: 2px;
					font-family: ${OP.font};
					font-size: 5.2pt;
					color: var(--dim);
				}

				section {
					margin-bottom: 6px;
				}

				.cv-sec {
					font-family: ${OP.font};
					font-size: 6.3pt;
					font-weight: 500;
					letter-spacing: 0.12em;
					text-transform: uppercase;
					color: var(--accent-text);
					margin-bottom: 5px;
				}

				.cv-summary {
					color: var(--muted);
					font-size: 7.7pt;
					line-height: 1.38;
					margin: 0;
				}

				.cv-summary strong,
				li strong,
				.cv-creds strong {
					color: var(--ink);
					font-weight: 600;
				}

				.cv-co-block {
					margin-bottom: 6px;
				}

				.cv-co-head {
					display: flex;
					justify-content: space-between;
					align-items: baseline;
					gap: 8px;
					margin-bottom: 4px;
					padding-bottom: 2px;
					border-bottom: 1px solid var(--line);
				}

				.cv-co-name {
					font-size: 9.2pt;
					font-weight: 700;
					color: var(--ink);
				}

				.cv-co-name span {
					color: var(--magenta);
				}

				.cv-co-span,
				.cv-role-meta {
					font-family: ${OP.font};
					font-size: 6pt;
					color: var(--dim);
					white-space: nowrap;
				}

				.cv-role {
					margin-bottom: 5px;
				}

				.cv-role-head {
					display: flex;
					justify-content: space-between;
					align-items: baseline;
					gap: 8px;
				}

				.cv-role-title {
					font-size: 8.4pt;
					font-weight: 600;
					color: var(--ink);
				}

				ul {
					list-style: none;
					margin: 2px 0 0;
					padding: 0;
				}

				li {
					position: relative;
					padding-left: 10px;
					margin-bottom: 1.5px;
					color: var(--muted);
					font-size: 7.2pt;
					line-height: 1.32;
				}

				li::before {
					content: '';
					position: absolute;
					left: 0;
					top: 0.5em;
					width: 3px;
					height: 3px;
					border-radius: 50%;
					background: var(--magenta);
				}

				.cv-one-line {
					font-size: 7.2pt;
					color: var(--muted);
					margin: 1px 0 0;
					line-height: 1.32;
				}

				.cv-talks {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 2px 12px;
				}

				.cv-talk {
					display: grid;
					grid-template-columns: 48px 1fr;
					gap: 5px;
					align-items: baseline;
					font-size: 7pt;
					line-height: 1.25;
				}

				.cv-talk-date,
				.cv-talk-event,
				.cv-when,
				.cv-lab {
					font-family: ${OP.font};
				}

				.cv-talk-date,
				.cv-when {
					font-size: 5.8pt;
					color: var(--dim);
				}

				.cv-talk-title {
					font-weight: 600;
					color: var(--ink);
				}

				.cv-talk-event,
				.cv-lab {
					font-size: 5.8pt;
					color: var(--magenta);
				}

				.cv-bottom {
					display: grid;
					grid-template-columns: 1.1fr 1fr;
					gap: 14px;
					margin-top: 2px;
				}

				.cv-edu {
					margin-bottom: 5px;
				}

				.cv-deg {
					font-size: 8pt;
					font-weight: 600;
				}

				.cv-sch,
				.cv-vals,
				.cv-creds {
					color: var(--muted);
				}

				.cv-sch,
				.cv-vals {
					font-size: 7.2pt;
				}

				.cv-badge {
					display: inline-block;
					font-family: ${OP.font};
					font-size: 5.5pt;
					color: var(--magenta);
					border: 1px solid rgba(237, 20, 91, 0.45);
					background: var(--magenta-soft);
					padding: 0 4px;
					border-radius: 999px;
					margin-left: 3px;
					vertical-align: middle;
				}

				.cv-skill-row {
					margin-bottom: 4px;
				}

				.cv-vals {
					line-height: 1.3;
				}

				.cv-creds {
					margin-top: 5px;
					font-size: 7pt;
				}

				.cv-footer {
					margin-top: 8px;
					padding-top: 6px;
					border-top: 1px solid var(--line);
					display: flex;
					justify-content: space-between;
					gap: 12px;
					font-family: ${OP.font};
					font-size: 5.8pt;
					color: var(--dim);
				}

				.cv-footer div:first-child {
					color: var(--magenta);
				}

				@media (max-width: 720px) {
					.cv-page {
						min-height: auto;
						padding: 24px 20px;
						font-size: 10px;
					}

					.cv-head {
						grid-template-columns: 64px 1fr;
						gap: 12px;
					}

					.cv-photo {
						width: 64px;
						height: 64px;
					}

					.cv-qr-wrap {
						display: none;
					}

					.cv-identity h1 {
						font-size: 26px;
					}

					.cv-title {
						font-size: 12px;
					}

					.cv-contacts,
					.cv-sec,
					.cv-co-span,
					.cv-role-meta,
					.cv-talk-date,
					.cv-talk-event,
					.cv-when,
					.cv-lab,
					.cv-footer {
						font-size: 10px;
					}

					.cv-summary,
					li,
					.cv-one-line,
					.cv-talk,
					.cv-sch,
					.cv-vals,
					.cv-creds {
						font-size: 12px;
					}

					.cv-co-head,
					.cv-role-head,
					.cv-footer {
						align-items: flex-start;
						flex-direction: column;
						gap: 2px;
					}

					.cv-co-span,
					.cv-role-meta {
						white-space: normal;
					}

					.cv-talks,
					.cv-bottom {
						grid-template-columns: 1fr;
					}

					.cv-talk {
						grid-template-columns: 64px 1fr;
					}
				}

				@media print {
					.cv-page {
						width: 210mm;
						height: 297mm;
						min-height: 297mm;
						box-shadow: none;
					}
				}
			`}</style>
		</article>
	);
}
