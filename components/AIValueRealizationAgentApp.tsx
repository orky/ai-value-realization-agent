"use client";
import React, { useMemo, useState } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { BarChart3, Briefcase, Calculator, CheckCircle2, ClipboardList, Rocket, SlidersHorizontal, Sparkles, Target } from "lucide-react";

type Company = {
  name: string;
  industry: string;
  employees: number;
  revenue: number;
  strategicPriorities: string;
  aiMaturity: string;
};

type Assumptions = {
  capability: number;
  workflowFit: number;
  adoption: number;
  autonomy: number;
  confidence: number;
  timeSavedRatio: number;
  championStrength: number;
  resistanceLevel: number;
};

type Workflow = {
  id: number;
  function: string;
  name: string;
  owner: string;
  monthlyVolume: number;
  timePerTaskMinutes: number;
  hourlyCost: number;
  errorRate: number;
  cycleTimeHours: number;
  complianceSensitivity: "low" | "medium" | "high";
  painPoints: string;
};

type UseCaseScores = {
  valueScore: number;
  feasibilityScore: number;
  adoptionScore: number;
  autonomyScore: number;
  ttvScore: number;
  priorityScore: number;
};

type UseCase = {
  id: number;
  workflowId: number;
  name: string;
  function: string;
  pattern: "Assistant" | "Copilot" | "Agent";
  capability: number;
  workflowFit: number;
  adoption: number;
  autonomy: number;
  confidence: number;
  annualEconomicValue: number;
  annualValueLow: number;
  annualValueMid: number;
  annualValueHigh: number;
  realizationRate: number;
  timeSavedRatio: number;
  championStrength: number;
  resistanceLevel: number;
} & UseCaseScores;

const initialCompany: Company = {
  name: "Acme Support Cloud",
  industry: "B2B SaaS",
  employees: 2500,
  revenue: 350000000,
  strategicPriorities: "Improve gross margin, accelerate sales productivity, reduce support cost, increase product adoption",
  aiMaturity: "emerging",
};

const initialAssumptions: Assumptions = {
  capability: 0.72,
  workflowFit: 0.78,
  adoption: 0.72,
  autonomy: 0.55,
  confidence: 0.72,
  timeSavedRatio: 0.35,
  championStrength: 0.6,
  resistanceLevel: 0.4,
};

const initialWorkflows: Workflow[] = [
  {
    id: 1,
    function: "Support",
    name: "L1 ticket triage and response drafting",
    owner: "VP Support",
    monthlyVolume: 18000,
    timePerTaskMinutes: 9,
    hourlyCost: 38,
    errorRate: 0.08,
    cycleTimeHours: 14,
    complianceSensitivity: "medium",
    painPoints: "Slow triage, inconsistent quality, backlog spikes",
  },
  {
    id: 2,
    function: "Sales",
    name: "RFP response generation",
    owner: "Sales Ops",
    monthlyVolume: 120,
    timePerTaskMinutes: 240,
    hourlyCost: 72,
    errorRate: 0.12,
    cycleTimeHours: 72,
    complianceSensitivity: "medium",
    painPoints: "SME bottlenecks, slow turnaround, repetitive drafting",
  },
  {
    id: 3,
    function: "Engineering",
    name: "Bug investigation and fix recommendation",
    owner: "VP Engineering",
    monthlyVolume: 450,
    timePerTaskMinutes: 80,
    hourlyCost: 95,
    errorRate: 0.18,
    cycleTimeHours: 48,
    complianceSensitivity: "low",
    painPoints: "Context switching, slow root-cause analysis, long queues",
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function scoreUseCase(workflow: Workflow): UseCaseScores {
  const annualLaborBaseline = workflow.monthlyVolume * 12 * (workflow.timePerTaskMinutes / 60) * workflow.hourlyCost;

  const valueScore = clamp(
    Math.round(
      annualLaborBaseline > 3000000
        ? 5
        : annualLaborBaseline > 1500000
          ? 4
          : annualLaborBaseline > 600000
            ? 3
            : annualLaborBaseline > 150000
              ? 2
              : 1
    ),
    1,
    5
  );

  const feasibilityBase = workflow.complianceSensitivity === "high" ? 2 : workflow.complianceSensitivity === "medium" ? 3.5 : 4.5;
  const feasibilityScore = clamp(Math.round(feasibilityBase), 1, 5);

  const adoptionScore = clamp(
    Math.round(
      workflow.timePerTaskMinutes >= 60 ? 4 : workflow.timePerTaskMinutes >= 15 ? 5 : 4
    ),
    1,
    5
  );

  const autonomyScore = clamp(
    Math.round(
      workflow.complianceSensitivity === "low" ? 4 : workflow.complianceSensitivity === "medium" ? 3 : 2
    ),
    1,
    5
  );

  const ttvScore = clamp(
    Math.round(
      workflow.monthlyVolume > 1000 ? 5 : workflow.monthlyVolume > 200 ? 4 : 3
    ),
    1,
    5
  );

  const priorityScore = Number((0.3 * valueScore + 0.25 * feasibilityScore + 0.15 * adoptionScore + 0.15 * autonomyScore + 0.15 * ttvScore).toFixed(2));

  return {
    valueScore,
    feasibilityScore,
    adoptionScore,
    autonomyScore,
    ttvScore,
    priorityScore,
  };
}

function buildUseCase(workflow: Workflow, assumptions: Assumptions): UseCase {
  const scores = scoreUseCase(workflow);

  const sensitivityCapability = workflow.complianceSensitivity === "low" ? 0.08 : workflow.complianceSensitivity === "medium" ? 0 : -0.1;
  const sensitivityWorkflowFit = workflow.monthlyVolume > 1000 ? 0.05 : -0.04;
  const sensitivityAdoption = workflow.timePerTaskMinutes > 60 ? -0.04 : 0.03;
  const sensitivityAutonomy = workflow.complianceSensitivity === "low" ? 0.12 : workflow.complianceSensitivity === "medium" ? 0 : -0.14;
  const sensitivityConfidence = workflow.errorRate < 0.1 ? 0.04 : -0.02;

  // Human dynamics (champions vs resistance)
  const championBoost = (assumptions.championStrength - 0.5) * 0.4;
  const resistancePenalty = (assumptions.resistanceLevel - 0.5) * 0.5;

  const capability = clamp(assumptions.capability + sensitivityCapability, 0.2, 0.98);
  const workflowFit = clamp(assumptions.workflowFit + sensitivityWorkflowFit, 0.2, 0.98);
  const adoption = clamp(assumptions.adoption + sensitivityAdoption + championBoost - resistancePenalty, 0.1, 0.98);
  const autonomy = clamp(assumptions.autonomy + sensitivityAutonomy, 0.1, 0.98);
  const confidence = clamp(assumptions.confidence + sensitivityConfidence + championBoost - resistancePenalty, 0.1, 0.98);

  const annualTaskVolume = workflow.monthlyVolume * 12;
  const timeSavedPerTaskHours = (workflow.timePerTaskMinutes / 60) * assumptions.timeSavedRatio;
  const annualEconomicValue = annualTaskVolume * timeSavedPerTaskHours * workflow.hourlyCost;
  const realizationRate = capability * workflowFit * adoption * autonomy * confidence;

  const annualValueMid = annualEconomicValue * realizationRate;
  const annualValueLow = annualValueMid * 0.7;
  const annualValueHigh = annualValueMid * 1.35;

  return {
    id: workflow.id,
    workflowId: workflow.id,
    name: `${workflow.name} AI Copilot`,
    function: workflow.function,
    pattern: autonomy >= 0.65 ? "Agent" : autonomy >= 0.5 ? "Copilot" : "Assistant",
    capability,
    workflowFit,
    adoption,
    autonomy,
    confidence,
    annualEconomicValue,
    annualValueLow,
    annualValueMid,
    annualValueHigh,
    realizationRate,
    timeSavedRatio: assumptions.timeSavedRatio,
    championStrength: assumptions.championStrength,
    resistanceLevel: assumptions.resistanceLevel,
    ...scores,
  };
}

function AssumptionInput({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  helper?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-sm font-medium text-slate-700">
          {Math.round(Number(value) * 100)}%
        </span>
      </div>
      <Input
        type="range"
        min="0.1"
        max="0.95"
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="cursor-pointer"
      />
      {helper ? <p className="text-xs text-slate-500 leading-5">{helper}</p> : null}
    </div>
  );
}

function KPI({
    label,
    value,
    subtext,
    icon: Icon,
  }: {
    label: string;
    value: string;
    subtext?: string;
    icon: LucideIcon;
  }) {
    return (
      <Card className="rounded-2xl shadow-sm border-slate-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-semibold tracking-tight mt-1">{value}</p>
              {subtext ? <p className="text-xs text-slate-500 mt-1">{subtext}</p> : null}
            </div>
            <div className="rounded-2xl p-3 bg-slate-50">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

export default function AIValueRealizationAgentApp() {
  const [company, setCompany] = useState<Company>(initialCompany);
const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
const [assumptions, setAssumptions] = useState<Assumptions>(initialAssumptions);
const [draftWorkflow, setDraftWorkflow] = useState<Omit<Workflow, "id">>({
    function: "Support",
    name: "",
    owner: "",
    monthlyVolume: 1000,
    timePerTaskMinutes: 15,
    hourlyCost: 40,
    errorRate: 0.1,
    cycleTimeHours: 24,
    complianceSensitivity: "medium",
    painPoints: "",
  });

  const useCases = useMemo(
    () => workflows.map((workflow) => buildUseCase(workflow, assumptions)).sort((a, b) => b.priorityScore - a.priorityScore),
    [workflows, assumptions]
  );

  const totals = useMemo(() => {
    const totalMid = useCases.reduce((sum, item) => sum + item.annualValueMid, 0);
    const totalEconomic = useCases.reduce((sum, item) => sum + item.annualEconomicValue, 0);
    const avgPriority = useCases.length
      ? useCases.reduce((sum, item) => sum + item.priorityScore, 0) / useCases.length
      : 0;
    return { totalMid, totalEconomic, avgPriority };
  }, [useCases]);

  function addWorkflow() {
    if (!draftWorkflow.name.trim()) return;
    setWorkflows((current) => [
      ...current,
      {
        ...draftWorkflow,
        id: Date.now(),
        monthlyVolume: Number(draftWorkflow.monthlyVolume),
        timePerTaskMinutes: Number(draftWorkflow.timePerTaskMinutes),
        hourlyCost: Number(draftWorkflow.hourlyCost),
        errorRate: Number(draftWorkflow.errorRate),
        cycleTimeHours: Number(draftWorkflow.cycleTimeHours),
      },
    ]);
    setDraftWorkflow({
      function: "Support",
      name: "",
      owner: "",
      monthlyVolume: 1000,
      timePerTaskMinutes: 15,
      hourlyCost: 40,
      errorRate: 0.1,
      cycleTimeHours: 24,
      complianceSensitivity: "medium",
      painPoints: "",
    });
  }

  const topUseCase = useCases[0];

  function updateAssumption(key: keyof Assumptions, value: number) {
  setAssumptions((current) => ({ ...current, [key]: value }));
}

  function resetAssumptions() {
    setAssumptions(initialAssumptions);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid lg:grid-cols-[1.35fr,0.75fr,0.9fr] gap-6"
        >
          <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="rounded-full px-3 py-1">AI Value Realization Agent</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">Consultant Copilot MVP</Badge>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight max-w-3xl">
                Move from vague AI interest to prioritized use cases, quantified value, and pilot-ready execution.
              </h1>
              <p className="mt-4 text-slate-600 max-w-3xl text-base leading-7">
                This prototype turns workflows into AI use cases, scores them across value and feasibility, and estimates expected realized value using capability, workflow fit, adoption, autonomy, and confidence multipliers.
              </p>

              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
                <KPI label="Portfolio value" value={formatCurrency(totals.totalMid)} subtext="Mid-case annual realized value" icon={BarChart3} />
                <KPI label="Economic potential" value={formatCurrency(totals.totalEconomic)} subtext="Before realization multipliers" icon={Calculator} />
                <KPI label="Use cases" value={String(useCases.length)} subtext="Generated from workflows" icon={Sparkles} />
                <KPI label="Average priority" value={totals.avgPriority.toFixed(2)} subtext="Weighted score across portfolio" icon={Target} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topUseCase ? (
                <>
                  <div>
                    <p className="text-sm text-slate-500">Use case</p>
                    <p className="text-lg font-semibold mt-1">{topUseCase.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="rounded-full">{topUseCase.function}</Badge>
                    <Badge variant="outline" className="rounded-full">{topUseCase.pattern}</Badge>
                    <Badge variant="secondary" className="rounded-full">Priority {topUseCase.priorityScore}</Badge>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Expected realization rate</span>
                      <span>{Math.round(topUseCase.capability * topUseCase.workflowFit * topUseCase.adoption * topUseCase.autonomy * topUseCase.confidence * 100)}%</span>
                    </div>
                    <Progress value={topUseCase.capability * topUseCase.workflowFit * topUseCase.adoption * topUseCase.autonomy * topUseCase.confidence * 100} />
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Pilot thesis</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      Start with this workflow because it combines repeatability, visible pain, and measurable impact. Design the pilot around baseline cycle time, human review rate, and adoption by the primary user group.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-slate-500">Add a workflow to generate a recommendation.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><SlidersHorizontal className="h-5 w-5" /> Assumptions panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Make assumptions explicit and defensible. Adjust the portfolio-wide inputs that convert theoretical economic value into expected realized value.
              </div>

              <AssumptionInput label="Capability" value={assumptions.capability} onChange={(value) => updateAssumption("capability", value)} helper="How well the model performs on the target task in practice." />
              <AssumptionInput label="Workflow fit" value={assumptions.workflowFit} onChange={(value) => updateAssumption("workflowFit", value)} helper="How naturally AI fits the real workflow, including context and handoffs." />
              <AssumptionInput label="Adoption" value={assumptions.adoption} onChange={(value) => updateAssumption("adoption", value)} helper="Expected sustained usage by the intended user group." />
              <AssumptionInput label="Autonomy" value={assumptions.autonomy} onChange={(value) => updateAssumption("autonomy", value)} helper="How much work is actually offloaded versus still requiring human intervention." />
              <AssumptionInput label="Confidence" value={assumptions.confidence} onChange={(value) => updateAssumption("confidence", value)} helper="Confidence that the predicted value can be captured given data, change, and execution realities." />
              <AssumptionInput label="Time saved" value={assumptions.timeSavedRatio} onChange={(value) => updateAssumption("timeSavedRatio", value)} helper="Percent of current task time expected to be reduced by AI for the workflow slice in scope." />

              <AssumptionInput label="Champion strength" value={assumptions.championStrength} onChange={(value) => updateAssumption("championStrength", value)} helper="Strength of internal champions driving adoption, enablement, and advocacy." />

              <AssumptionInput label="Resistance level" value={assumptions.resistanceLevel} onChange={(value) => updateAssumption("resistanceLevel", value)} helper="Degree of skepticism or cultural resistance that may block adoption or slow rollout." />

              <Button variant="outline" onClick={resetAssumptions} className="rounded-2xl w-full">Reset assumptions</Button>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="discovery" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-3xl rounded-2xl">
            <TabsTrigger value="discovery">Discovery</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="business-case">Business Case</TabsTrigger>
            <TabsTrigger value="pilot">Pilot Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="discovery" className="space-y-6">
            <div className="grid xl:grid-cols-[1.1fr,0.9fr] gap-6">
              <Card className="rounded-[24px] shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl"><Briefcase className="h-5 w-5" /> Company context</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company name</Label>
                    <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Employees</Label>
                    <Input type="number" value={company.employees} onChange={(e) => setCompany({ ...company, employees: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Revenue</Label>
                    <Input type="number" value={company.revenue} onChange={(e) => setCompany({ ...company, revenue: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Strategic priorities</Label>
                    <Textarea value={company.strategicPriorities} onChange={(e) => setCompany({ ...company, strategicPriorities: e.target.value })} rows={4} />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl"><ClipboardList className="h-5 w-5" /> Add workflow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Function</Label>
                      <Select value={draftWorkflow.function} onValueChange={(value) => setDraftWorkflow({ ...draftWorkflow, function: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Owner</Label>
                      <Input value={draftWorkflow.owner} onChange={(e) => setDraftWorkflow({ ...draftWorkflow, owner: e.target.value })} placeholder="VP Support" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Workflow name</Label>
                    <Input value={draftWorkflow.name} onChange={(e) => setDraftWorkflow({ ...draftWorkflow, name: e.target.value })} placeholder="Example: renewal risk triage" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Monthly volume</Label>
                      <Input type="number" value={draftWorkflow.monthlyVolume} onChange={(e) => setDraftWorkflow({ ...draftWorkflow, monthlyVolume: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Time per task (minutes)</Label>
                      <Input type="number" value={draftWorkflow.timePerTaskMinutes} onChange={(e) => setDraftWorkflow({ ...draftWorkflow, timePerTaskMinutes: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Hourly cost</Label>
                      <Input type="number" value={draftWorkflow.hourlyCost} onChange={(e) => setDraftWorkflow({ ...draftWorkflow, hourlyCost: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Cycle time (hours)</Label>
                      <Input type="number" value={draftWorkflow.cycleTimeHours} onChange={(e) => setDraftWorkflow({ ...draftWorkflow, cycleTimeHours: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Compliance sensitivity</Label>
                    <Select value={draftWorkflow.complianceSensitivity} onValueChange={(value: "low" | "medium" | "high") =>
  setDraftWorkflow({ ...draftWorkflow, complianceSensitivity: value })
}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pain points</Label>
                    <Textarea value={draftWorkflow.painPoints} onChange={(e) => setDraftWorkflow({ ...draftWorkflow, painPoints: e.target.value })} rows={3} placeholder="Backlog, inconsistency, slow turnaround, error-prone work..." />
                  </div>
                  <Button onClick={addWorkflow} className="rounded-2xl w-full">Add workflow</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card className="rounded-[24px] shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-5 w-5" /> Prioritized use-case portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Use case</TableHead>
                      <TableHead>Function</TableHead>
                      <TableHead>Pattern</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Mid-case value</TableHead>
                      <TableHead>Value / Feasibility / Adoption</TableHead>
                      <TableHead>Realization rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {useCases.map((useCase) => (
                      <TableRow key={useCase.id}>
                        <TableCell className="font-medium">{useCase.name}</TableCell>
                        <TableCell>{useCase.function}</TableCell>
                        <TableCell>{useCase.pattern}</TableCell>
                        <TableCell>{useCase.priorityScore}</TableCell>
                        <TableCell>{formatCurrency(useCase.annualValueMid)}</TableCell>
                        <TableCell>{useCase.valueScore} / {useCase.feasibilityScore} / {useCase.adoptionScore}</TableCell>
                        <TableCell>{Math.round(useCase.realizationRate * 100)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business-case">
            <div className="grid xl:grid-cols-3 gap-6">
              {useCases.map((useCase) => (
                <Card key={useCase.id} className="rounded-[24px] shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">{useCase.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Low</p>
                        <p className="text-lg font-semibold mt-1">{formatCurrency(useCase.annualValueLow)}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Mid</p>
                        <p className="text-lg font-semibold mt-1">{formatCurrency(useCase.annualValueMid)}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 col-span-2">
                        <p className="text-xs text-slate-500">High</p>
                        <p className="text-lg font-semibold mt-1">{formatCurrency(useCase.annualValueHigh)}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between"><span>Champion strength</span><span>{Math.round(useCase.championStrength * 100)}%</span></div>
                      <div className="flex items-center justify-between"><span>Resistance level</span><span>{Math.round(useCase.resistanceLevel * 100)}%</span></div>
                      <div className="flex items-center justify-between"><span>Realization rate</span><span>{Math.round(useCase.realizationRate * 100)}%</span></div>
                      <div className="flex items-center justify-between"><span>Capability</span><span>{Math.round(useCase.capability * 100)}%</span></div>
                      <div className="flex items-center justify-between"><span>Workflow fit</span><span>{Math.round(useCase.workflowFit * 100)}%</span></div>
                      <div className="flex items-center justify-between"><span>Adoption</span><span>{Math.round(useCase.adoption * 100)}%</span></div>
                      <div className="flex items-center justify-between"><span>Autonomy</span><span>{Math.round(useCase.autonomy * 100)}%</span></div>
                      <div className="flex items-center justify-between"><span>Confidence</span><span>{Math.round(useCase.confidence * 100)}%</span></div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                      <p><span className="font-medium text-slate-900">Formula:</span> Annual Economic Value × Capability × Workflow Fit × Adoption × Autonomy × Confidence</p>
                      <p className="mt-2"><span className="font-medium text-slate-900">Why this matters:</span> The goal is not false precision. It is making assumptions explicit and defensible.</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pilot">
            <Card className="rounded-[24px] shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Rocket className="h-5 w-5" /> Pilot charter</CardTitle>
              </CardHeader>
              <CardContent>
                {topUseCase ? (
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="text-sm text-slate-500">Pilot scope</p>
                        <p className="mt-2 leading-7 text-slate-700">
                          Launch {topUseCase.name} for one team in {topUseCase.function}. Start with a narrow workflow slice, maintain human review, and instrument adoption, time saved, quality, and exception rates from day one.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="text-sm text-slate-500">Success criteria</p>
                        <ul className="mt-2 space-y-2 text-slate-700 text-sm">
                          <li>• 60%+ weekly active usage by target users</li>
                          <li>• 25%+ reduction in average handling time or cycle time</li>
                          <li>• No material quality regression</li>
                          <li>• Clear path to scaled rollout economics</li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 p-5">
                        <p className="text-sm text-slate-500">Recommended owners</p>
                        <div className="mt-3 space-y-3 text-sm">
                          <div className="flex items-center justify-between"><span>Executive sponsor</span><span>{workflows.find((w) => w.id === topUseCase.workflowId)?.owner || "TBD"}</span></div>
                          <div className="flex items-center justify-between"><span>Pilot lead</span><span>Transformation / Value Lead</span></div>
                          <div className="flex items-center justify-between"><span>Technical owner</span><span>Solutions Architect</span></div>
                          <div className="flex items-center justify-between"><span>Adoption owner</span><span>Functional team manager</span></div>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-5">
                        <p className="text-sm text-slate-500">Measurement plan</p>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          {[
                            "Adoption rate",
                            "Workflow coverage",
                            "Human review rate",
                            "Time saved per task",
                            "Cycle time reduction",
                            "Quality / error rate",
                            "Exception rate",
                            "Realized value vs forecast",
                          ].map((metric) => (
                            <div key={metric} className="rounded-xl bg-slate-50 p-3 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>{metric}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">Add a workflow to generate a pilot charter.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
