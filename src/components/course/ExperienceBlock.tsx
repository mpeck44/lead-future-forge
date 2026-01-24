import mikeHeadshot from '@/assets/mike-headshot.jpg';

interface ExperienceBlockProps {
  content: string;
  variant?: 'experience' | 'field-note';
}

const ExperienceBlock = ({ content, variant = 'experience' }: ExperienceBlockProps) => {
  const isFieldNote = variant === 'field-note';
  
  return (
    <div className="bg-muted/50 border-l-4 border-primary rounded-lg p-4 my-6">
      <div className="flex items-center gap-3 mb-3">
        {!isFieldNote && (
          <img 
            src={mikeHeadshot} 
            alt="Mike Peck" 
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        )}
        <span className="text-sm font-bold text-primary uppercase tracking-wide">
          {isFieldNote ? '📝 FIELD NOTE' : '💡 FROM MIKE\'S EXPERIENCE'}
        </span>
      </div>
      <div className="text-foreground leading-relaxed font-body whitespace-pre-line">
        {content}
      </div>
    </div>
  );
};

export default ExperienceBlock;
