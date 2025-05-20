import localFont from 'next/font/local';

export const gotens = localFont({
    src: [
        {
            path: './Gotens/gotens-regular.otf',
            weight: '200',
            style: 'normal',
        },
        {
            path: './Gotens/gotens-italic.otf',
            weight: '400',
            style: 'italic',
        },
    ],
    variable: '--font-gotens',
    display: 'swap',
}); 