import Image from "next/legacy/image";

interface XFigureProps {
	alt?: string;
	caption?: string;
	src: string;
}

export function XFigure({ alt, caption, src }: XFigureProps) {
	return (
		<figure>
			<Image
				alt={alt ?? caption}
				className="rounded-3xl object-cover select-none hover:shadow-xl"
				draggable={false}
				height={1080}
				layout="responsive"
				src={src}
				width={1920}
			/>
			<figcaption>{alt ?? caption}</figcaption>
		</figure>
	);
}
