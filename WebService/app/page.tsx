"use client"

import { useState } from "react"
import { Search, ArrowLeft, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

const searchItems = [
  {
    id: 2557,
    title: "Краснодарский край, г Сочи, с Нижняя Шиловка",
    description: "ул Светогорская, д. 12 • Частный дом • 3 комнаты • 125.60 м²",
    avatar: "С",
    data: {
      accountId: 2557,
      isCommercial: false,
      address: "Краснодарский край, г Сочи, с Нижняя Шиловка, ул Светогорская, д. 12",
      buildingType: "Частный",
      roomsCount: 3,
      residentsCount: 3,
      totalArea: 125.6,
      consumption: {
        "1": 6587,
        "2": 5983,
        "3": 5166,
        "4": 5200,
        "5": 5385,
        "6": 3692,
        "7": 4002,
        "8": 4191,
        "9": 3647,
        "10": 3656,
        "11": 4311,
        "12": 3470,
      },
      is_commercial_prob: 0.345643,
    },
  },
  {
    id: 2558,
    title: "Краснодарский край, г Краснодар, ул Красная",
    description: "д. 45 • Коммерческое • 8 комнат • 280.50 м²",
    avatar: "К",
    data: {
      accountId: 2558,
      isCommercial: true,
      address: "Краснодарский край, г Краснодар, ул Красная, д. 45",
      buildingType: "Коммерческое",
      roomsCount: 8,
      residentsCount: 15,
      totalArea: 280.5,
      consumption: {
        "1": 8587,
        "2": 7983,
        "3": 7166,
        "4": 7200,
        "5": 7385,
        "6": 5692,
        "7": 6002,
        "8": 6191,
        "9": 5647,
        "10": 5656,
        "11": 6311,
        "12": 5470,
      },
      is_commercial_prob: 0.845643,
    },
  },
  {
    id: 2559,
    title: "Краснодарский край, г Анапа, ул Морская",
    description: "д. 23 • Частный дом • 5 комнат • 180.30 м²",
    avatar: "А",
    data: {
      accountId: 2559,
      isCommercial: false,
      address: "Краснодарский край, г Анапа, ул Морская, д. 23",
      buildingType: "Частный",
      roomsCount: 5,
      residentsCount: 4,
      totalArea: 180.3,
      consumption: {
        "1": 5587,
        "2": 4983,
        "3": 4166,
        "4": 4200,
        "5": 4385,
        "6": 2692,
        "7": 3002,
        "8": 3191,
        "9": 2647,
        "10": 2656,
        "11": 3311,
        "12": 2470,
      },
      is_commercial_prob: 0.245643,
    },
  },
  {
    id: 2560,
    title: "Краснодарский край, г Геленджик, ул Курортная",
    description: "д. 78 • Многоквартирный • 2 комнаты • 65.80 м²",
    avatar: "Г",
    data: {
      accountId: 2560,
      isCommercial: false,
      address: "Краснодарский край, г Геленджик, ул Курортная, д. 78",
      buildingType: "Многоквартирный",
      roomsCount: 2,
      residentsCount: 2,
      totalArea: 65.8,
      consumption: {
        "1": 3587,
        "2": 2983,
        "3": 2166,
        "4": 2200,
        "5": 2385,
        "6": 1692,
        "7": 2002,
        "8": 2191,
        "9": 1647,
        "10": 1656,
        "11": 2311,
        "12": 1470,
      },
      is_commercial_prob: 0.145643,
    },
  },
  {
    id: 2561,
    title: "Краснодарский край, г Новороссийск, ул Портовая",
    description: "д. 156 • Коммерческое • 12 комнат • 450.20 м²",
    avatar: "Н",
    data: {
      accountId: 2561,
      isCommercial: true,
      address: "Краснодарский край, г Новороссийск, ул Портовая, д. 156",
      buildingType: "Коммерческое",
      roomsCount: 12,
      residentsCount: 25,
      totalArea: 450.2,
      consumption: {
        "1": 12587,
        "2": 11983,
        "3": 10166,
        "4": 10200,
        "5": 10385,
        "6": 8692,
        "7": 9002,
        "8": 9191,
        "9": 8647,
        "10": 8656,
        "11": 9311,
        "12": 8470,
      },
      is_commercial_prob: 0.945643,
    },
  },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)

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
