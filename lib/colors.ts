import defaultTheme from 'windicss/defaultTheme';

export const colors: Record<string, Record<number, string>> = {
	...defaultTheme.colors,
	gray: {
		50: '#f9fafb',
		100: '#eaeaeb',
		200: '#cacbcd',
		300: '#a7a9ac',
		400: '#696c71',
		500: '#282d34',
		600: '#232424',
		700: '#181b20',
		800: '#121518',
		900: '#0c0e10',
	},
	primary: {
		50: '#2196F3',
		100: '#2196F3',
		200: '#2196F3',
		300: '#2196F3',
		400: '#2196F3',
		500: '#2196F3',
		600: '#2196F3',
		700: '#2196F3',
		800: '#2196F3',
		900: '#2196F3',
	},
	secondary: {
		50: '#EC749C',
		100: '#EC749C',
		200: '#EC749C',
		300: '#EC749C',
		400: '#EC749C',
		500: '#EC749C',
		600: '#EC749C',
		700: '#F26191',
		800: '#F4558A',
		900: '#EC407A',
	},
};
