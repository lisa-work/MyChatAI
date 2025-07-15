'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, MessageCircle } from 'lucide-react';

type SearchResult = {
  id: string;
  title: string;
  snippet: string;
  date: Date;
  tags: string[];
  chatId: string;
};

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Machine Learning Basics',
    snippet: 'We discussed the fundamental concepts of supervised and unsupervised learning...',
    date: new Date(2024, 0, 15),
    tags: ['AI', 'Learning'],
    chatId: 'chat-1',
  },
  {
    id: '2',
    title: 'Healthy Recipe Ideas',
    snippet: 'Here are some nutritious meal prep recipes that are both delicious and easy...',
    date: new Date(2024, 0, 14),
    tags: ['Cooking', 'Health'],
    chatId: 'chat-2',
  },
  {
    id: '3',
    title: 'Travel Planning Tips',
    snippet: 'When planning your next adventure, consider these essential travel tips...',
    date: new Date(2024, 0, 13),
    tags: ['Travel', 'Tips'],
    chatId: 'chat-3',
  },
];

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setResults(filteredResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Search Chats</h1>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search through your conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={!searchQuery.trim() || isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isSearching && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Searching...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Search Results ({results.length})
            </h2>
          </div>
          
          <div className="grid gap-4">
            {results.map((result) => (
              <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        {result.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {result.snippet}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {result.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {result.date.toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {searchQuery && results.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
          No results found for &quot;{searchQuery}&quot;. Try different keywords or check your spelling.
          </p>
        </div>
      )}

      {!searchQuery && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Search through your chat history to find specific conversations or topics.
          </p>
        </div>
      )}
    </div>
  );
}