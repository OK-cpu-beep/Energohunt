"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, TrendingUp, Users, Activity, Zap, Home, Building, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

// Sample data - in real app this would come from API
const accountsData = {
  2557: {
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
  2558: {
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
  2559: {
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
  2560: {
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
  2561: {
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
}

const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [accountData, setAccountData] = useState(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const accountId = searchParams.get("accountId") || "2557"
    const data = accountsData[accountId]
    setAccountData(data)
  }, [searchParams])

  if (!accountData) {
    return <div>Загрузка...</div>
  }

  const consumptionArray = Object.entries(accountData.consumption).map(([month, value]) => ({
    month: monthNames[Number.parseInt(month) - 1],
    value: Number.parseInt(value),
    monthNum: Number.parseInt(month),
  }))

  const maxConsumption = Math.max(...consumptionArray.map((d) => d.value))
  const totalConsumption = consumptionArray.reduce((sum, item) => sum + item.value, 0)
  const avgConsumption = Math.round(totalConsumption / 12)
  const maxMonth = consumptionArray.find((item) => item.value === maxConsumption)
  const minMonth = consumptionArray.find((item) => item.value === Math.min(...consumptionArray.map((d) => d.value)))

  // Calculate seasonal consumption
  const winterConsumption = [consumptionArray[11], consumptionArray[0], consumptionArray[1]].reduce(
    (sum, item) => sum + item.value,
    0,
  )
  const springConsumption = [consumptionArray[2], consumptionArray[3], consumptionArray[4]].reduce(
    (sum, item) => sum + item.value,
    0,
  )
  const summerConsumption = [consumptionArray[5], consumptionArray[6], consumptionArray[7]].reduce(
    (sum, item) => sum + item.value,
    0,
  )
  const autumnConsumption = [consumptionArray[8], consumptionArray[9], consumptionArray[10]].reduce(
    (sum, item) => sum + item.value,
    0,
  )

  const seasonalData = [
    { season: "Зима", value: winterConsumption, color: "bg-blue-500" },
    { season: "Весна", value: springConsumption, color: "bg-green-500" },
    { season: "Лето", value: summerConsumption, color: "bg-yellow-500" },
    { season: "Осень", value: autumnConsumption, color: "bg-orange-500" },
  ]

  const maxSeasonal = Math.max(...seasonalData.map((d) => d.value))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-white/50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Панель аналитики</h1>
            <p className="text-gray-600 mt-1">Лицевой счет #{accountData.accountId}</p>
          </div>
          <Badge variant={accountData.isCommercial ? "destructive" : "secondary"}>
            {accountData.isCommercial ? "Коммерческий" : "Частный"}
          </Badge>
        </div>

        {/* Address Info */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-green-600 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{accountData.address}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span>{accountData.buildingType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-500" />
                    <span>{accountData.roomsCount} комнат</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{accountData.residentsCount} жильцов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <span>{accountData.totalArea} м²</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Обзор
            </TabsTrigger>
            <TabsTrigger
              value="consumption"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Потребление
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Аналитика
            </TabsTrigger>
            <TabsTrigger
              value="predictions"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Прогнозы
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Общее потребление</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalConsumption.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">кВт·ч за год</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Среднее потребление</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgConsumption.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">кВт·ч в месяц</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Пик потребления</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{maxConsumption.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">{maxMonth.month}</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">На м²</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(totalConsumption / accountData.totalArea)}</div>
                  <p className="text-xs text-gray-600">кВт·ч/м² в год</p>
                </CardContent>
              </Card>
            </div>

            {/* Seasonal Consumption Chart */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Потребление по сезонам</CardTitle>
                <p className="text-sm text-gray-600">Сравнение потребления энергии по временам года</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {seasonalData.map((season, index) => (
                    <div key={index} className="text-center">
                      <div className="mb-2">
                        <div
                          className={`${season.color} rounded-lg mx-auto transition-all duration-500`}
                          style={{
                            height: `${(season.value / maxSeasonal) * 120 + 20}px`,
                            width: "60px",
                          }}
                        ></div>
                      </div>
                      <div className="text-sm font-medium">{season.season}</div>
                      <div className="text-xs text-gray-600">{season.value.toLocaleString()} кВт·ч</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consumption Tab */}
          <TabsContent value="consumption" className="space-y-6">
            {/* Monthly Consumption Chart */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Месячное потребление</CardTitle>
                <p className="text-sm text-gray-600">Потребление электроэнергии по месяцам</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consumptionArray.map((data, index) => (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{data.month}</span>
                        <span className="text-sm text-gray-600">{data.value.toLocaleString()} кВт·ч</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000 ease-out group-hover:from-green-600 group-hover:to-green-500"
                          style={{
                            width: `${(data.value / maxConsumption) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Consumption Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Максимальное потребление</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-2">{maxMonth.value.toLocaleString()}</div>
                  <p className="text-gray-600">кВт·ч в {maxMonth.month}</p>
                  <div className="mt-4 text-sm text-gray-500">
                    На {Math.round(((maxMonth.value - avgConsumption) / avgConsumption) * 100)}% выше среднего
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Минимальное потребление</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">{minMonth.value.toLocaleString()}</div>
                  <p className="text-gray-600">кВт·ч в {minMonth.month}</p>
                  <div className="mt-4 text-sm text-gray-500">
                    На {Math.round(((avgConsumption - minMonth.value) / avgConsumption) * 100)}% ниже среднего
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Эффективность</CardTitle>
                  <p className="text-sm text-gray-600">кВт·ч на человека в месяц</p>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {Math.round(avgConsumption / accountData.residentsCount)}
                  </div>
                  <p className="text-sm text-gray-600">Среднее потребление на жильца</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Сезонность</CardTitle>
                  <p className="text-sm text-gray-600">Разница зима/лето</p>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {Math.round(((winterConsumption - summerConsumption) / summerConsumption) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600">Зима больше лета</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Стабильность</CardTitle>
                  <p className="text-sm text-gray-600">Коэффициент вариации</p>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {Math.round(
                      ((maxConsumption - Math.min(...consumptionArray.map((d) => d.value))) / avgConsumption) * 100,
                    )}
                    %
                  </div>
                  <p className="text-sm text-gray-600">Разброс потребления</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Ключевые показатели</CardTitle>
                <p className="text-sm text-gray-600">Анализ потребления энергии</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Пиковое потребление приходится на {maxMonth.month} - период максимальной нагрузки</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Минимальное потребление в {minMonth.month} - наиболее эффективный период</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>
                      Среднее потребление на м² составляет {Math.round(avgConsumption / accountData.totalArea)} кВт·ч
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>
                      Зимнее потребление превышает летнее на{" "}
                      {Math.round(((winterConsumption - summerConsumption) / summerConsumption) * 100)}%
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Прогноз коммерческого использования</CardTitle>
                <p className="text-sm text-gray-600">Вероятность коммерческого использования объекта</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl font-bold text-gray-900">
                    {Math.round(accountData.is_commercial_prob * 100)}%
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-green-500 to-yellow-500 h-4 rounded-full transition-all duration-1000"
                        style={{ width: `${accountData.is_commercial_prob * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {accountData.is_commercial_prob > 0.7
                    ? "Высокая вероятность коммерческого использования"
                    : accountData.is_commercial_prob > 0.4
                      ? "Средняя вероятность коммерческого использования"
                      : "Низкая вероятность коммерческого использования"}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Прогноз на следующий месяц</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.round(avgConsumption * 1.05).toLocaleString()}
                  </div>
                  <p className="text-gray-600">кВт·ч (прогноз)</p>
                  <div className="mt-4 text-sm text-gray-500">+5% от среднего значения</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Рекомендации</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">• Рассмотрите установку энергосберегающих устройств</div>
                  <div className="text-sm">• Оптимизируйте потребление в пиковые месяцы</div>
                  <div className="text-sm">• Проведите энергоаудит помещения</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
