/** Certificates shown in the Education section. Images are in public/certs/ (resized, and only ones with no personal numbers). */
export type Certificate = { title: string; issuer: string; when: string; image: string };

export const certificates: Certificate[] = [
  { title: "Women Tech Quest 2026: Build with AI", issuer: "10Pearls", when: "Oct 2026", image: "/certs/wtq-2026.jpg" },
  { title: "Diploma in Graphics and Web Design (Distinction)", issuer: "Arena Multimedia", when: "Oct 2022", image: "/certs/arena-diploma.jpg" },
  { title: "Certificate of Merit: 3rd position, BS Software Engineering", issuer: "Sir Syed University (SSUET)", when: "2024", image: "/certs/ssuet-merit-third.jpg" },
  { title: "Microfest++ Graphic Designing competition", issuer: "Microsoft Student Partners", when: "May 2020", image: "/certs/microfest-graphic-design.jpg" },
  { title: "Adobe Illustrator Portfolio course", issuer: "Buraq", when: "May 2020", image: "/certs/adobe-illustrator.jpg" },
  { title: "SharePoint in Microsoft Azure session", issuer: "Microsoft Student Ambassadors", when: "Dec 2020", image: "/certs/sharepoint-azure.jpg" },
  { title: "NCRMUN II, delegate", issuer: "NCR-CET", when: "Jan 2018", image: "/certs/ncrmun-2018.jpg" },
  { title: "Field trip at Siemens", issuer: "College of Emerging Technologies", when: "2018", image: "/certs/siemens-field-trip.jpg" },
];
