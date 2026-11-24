import React from 'react';
import { useInvitationData } from '../context/InvitationContext';

export const CulturalBlessing: React.FC = () => {
  const { invitationInfo } = useInvitationData();

  return (
    <section aria-labelledby="salam-heading" className="px-1">
      <div className="card-storybook rounded-3xl p-6 text-center">
        <p
          className="font-arabic text-2xl leading-[2.2] text-[#2B2D42] mb-2"
          dir="rtl"
          lang="ar"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        <h2
          id="salam-heading"
          className="text-lg font-extrabold text-[#D62828] mb-3 [text-wrap:balance]"
        >
          Assalamu’alaikum Warahmatullahi Wabarakatuh
        </h2>

        <p className="text-[15px] leading-[1.7] text-[#2B2D42] mb-5">
          {invitationInfo.invitation_message ||
            'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk turut hadir memberikan doa restu pada acara Walimatul Khitan putra kami, langkah awal sang pemberani menuju pribadi yang sholeh, sehat, dan penuh semangat.'}
        </p>

        <div className="bg-[#FFF9F2] rounded-2xl p-4 border border-[#FCBF49]/40">
          <p
            className="font-arabic text-lg leading-[2] text-[#2B2D42] mb-2"
            dir="rtl"
            lang="ar"
          >
            ثُمَّ أَوْحَيْنَا إِلَيْكَ أَنِ اتَّبِعْ مِلَّةَ إِبْرَاهِيمَ حَنِيفًا
          </p>
          <p className="text-xs leading-[1.65] text-[#5C403D]">
            “Kemudian Kami wahyukan kepadamu (Muhammad): ‘Ikutilah agama Ibrahim seorang yang hanif’.”
          </p>
          <p className="text-[11px] font-bold tracking-[0.04em] text-[#7D5800] mt-1.5">
            QS. An-Nahl · Ayat 123
          </p>
        </div>
      </div>
    </section>
  );
};
