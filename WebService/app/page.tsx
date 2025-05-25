"use client"

import { useState,useEffect } from "react"
import { Search, ArrowLeft, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { fetchSearchItems } from '@/lib/api';
import Link from "next/link"

export interface SearchItem {
  id: number;
  title: string;
  description: string;
  avatar: string;
  data: {
    accountId: number;
    isCommercial: boolean;
    address: string;
    buildingType: string;
    roomsCount: number;
    residentsCount: number;
    totalArea: number | null;
    consumption: Record<string, number>;
    is_commercial_prob: number;
  };
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSearchItems(1, 200);
        setSearchItems(data);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const filteredItems = searchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-green-300 rounded-full opacity-30 blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/images/thc-logo-new.png" alt="THC ЭНЕРГО Кубань" className="h-16 w-auto object-contain" />
        </div>

        {/* Search Interface */}
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-2xl overflow-hidden">
          <div className="p-6">
            {/* Search Header */}
            <div className="flex items-center gap-4 mb-6">
              {isSearchActive && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchActive(false)}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Введите текст"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setIsSearchActive(true)
                  }}
                  onFocus={() => setIsSearchActive(true)}
                  className="pl-10 pr-10 bg-white/90 border-0 text-gray-900 placeholder:text-gray-500 focus:bg-white"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSearchQuery("")
                      setIsSearchActive(false)
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 h-6 w-6"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Search Results */}
            {(isSearchActive || searchQuery) && (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <Link key={item.id} href={`/dashboard?accountId=${item.id}`}>
                    <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200 cursor-pointer group">
                      <Avatar className="w-12 h-12 bg-white text-green-600 font-semibold">
                        <AvatarFallback className="bg-white text-green-600">{item.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white group-hover:text-green-100 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-green-100 opacity-90 mt-1 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                {filteredItems.length === 0 && searchQuery && (
                  <div className="text-center py-8 text-white/80">
                    <p>Результаты не найдены для "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Default state when not searching */}
            {!isSearchActive && !searchQuery && (
              <div className="text-center py-12 text-white/80">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Начните печатать для поиска...</p>
                <p className="text-sm mt-2 opacity-75">Найдите аналитику, отчеты и системные инструменты</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Мониторинг в реальном времени</h3>
            <p className="text-sm text-gray-600">
              Мониторинг энергетических систем в реальном времени с расширенной аналитикой
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Умные отчеты</h3>
            <p className="text-sm text-gray-600">Создание интеллектуальных отчетов с инсайтами на основе ИИ</p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-purple-500 rounded"></div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Оптимизация энергии</h3>
            <p className="text-sm text-gray-600">Оптимизация потребления энергии с умными рекомендациями</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
