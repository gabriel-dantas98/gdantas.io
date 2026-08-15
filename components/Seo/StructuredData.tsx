import React from 'react';

interface StructuredDataProps {
	data: object | object[];
}

export function StructuredData({ data }: StructuredDataProps) {
	const entries = Array.isArray(data) ? data : [data];

	return (
		<>
			{entries.map((entry, index) => (
				<script
					key={index}
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(entry).replace(/</g, '\\u003c'),
					}}
				/>
			))}
		</>
	);
}
