'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, PenLine } from 'lucide-react';
import { DemandExample, demandExamples } from './example-demands';

interface DemandExampleSelectorProps {
  onSelectExample: (example: DemandExample) => void;
  onSkip: () => void;
}

export default function DemandExampleSelector({ onSelectExample, onSkip }: DemandExampleSelectorProps) {
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  
  const handleSelect = (id: string) => {
    setSelectedExampleId(id);
  };
  
  const handleUseExample = () => {
    const example = demandExamples.find(e => e.id === selectedExampleId);
    if (example) {
      onSelectExample(example);
    }
  };

  const truncateDescription = (description: string, maxLength = 200) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">从示例中选择</h2>
        <Button variant="ghost" onClick={onSkip}>
          跳过，直接创建
          <PenLine className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {demandExamples.map((example) => (
          <Card 
            key={example.id} 
            className={`cursor-pointer transition-all ${
              selectedExampleId === example.id 
                ? 'border-orange-500 ring-1 ring-orange-500' 
                : 'hover:border-gray-300'
            }`}
            onClick={() => handleSelect(example.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between">
                <span className="text-lg">{example.title}</span>
                {selectedExampleId === example.id && (
                  <CheckCircle2 className="h-5 w-5 text-orange-500" />
                )}
              </CardTitle>
              <CardDescription>
                <Badge variant="outline" className="mr-2">
                  {example.category}
                </Badge>
                {example.budget && (
                  <Badge variant="secondary" className="mr-2">
                    {example.budget}
                  </Badge>
                )}
                {example.timeline && (
                  <Badge variant="secondary">
                    {example.timeline}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {truncateDescription(example.description)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-end space-x-4 mt-6">
        <Button
          variant="outline"
          onClick={onSkip}
        >
          跳过
        </Button>
        <Button
          onClick={handleUseExample}
          disabled={!selectedExampleId}
        >
          使用选中的示例
        </Button>
      </div>
    </div>
  );
} 