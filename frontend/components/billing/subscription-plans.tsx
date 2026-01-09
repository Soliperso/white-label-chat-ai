'use client';

import { Check, Zap, Rocket, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUpgradeSubscription } from '@/hooks/use-billing';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  features: PlanFeature[];
  popular?: boolean;
  cta: string;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'Perfect for small businesses getting started',
    icon: <Zap className="h-6 w-6" />,
    features: [
      { text: '1,000 messages/month', included: true },
      { text: '1 widget', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'Custom branding', included: false },
      { text: 'API access', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    description: 'For growing businesses that need more',
    icon: <Rocket className="h-6 w-6" />,
    popular: true,
    features: [
      { text: '10,000 messages/month', included: true },
      { text: '5 widgets', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Custom branding', included: true },
      { text: 'API access', included: true },
      { text: 'Priority support', included: false },
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    description: 'For large organizations with custom needs',
    icon: <Building2 className="h-6 w-6" />,
    features: [
      { text: 'Unlimited messages', included: true },
      { text: 'Unlimited widgets', included: true },
      { text: 'Custom analytics', included: true },
      { text: '24/7 phone support', included: true },
      { text: 'Full white-label', included: true },
      { text: 'Full API access', included: true },
      { text: 'Dedicated account manager', included: true },
    ],
    cta: 'Contact Sales',
  },
];

interface SubscriptionPlansProps {
  currentPlan?: string;
}

export function SubscriptionPlans({ currentPlan = 'starter' }: SubscriptionPlansProps) {
  const upgradeMutation = useUpgradeSubscription();

  const handlePlanSelect = (planId: string, planName: string) => {
    if (planId === 'enterprise') {
      toast.info('Contact sales for Enterprise plan');
      // In production: window.location.href = 'mailto:sales@chatforge.com';
      return;
    }

    toast.promise(
      upgradeMutation.mutateAsync(planId),
      {
        loading: `Upgrading to ${planName} plan...`,
        success: `Successfully upgraded to ${planName} plan!`,
        error: 'Failed to upgrade plan. Please try again.',
      }
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const isCurrentPlan = plan.id === currentPlan;

        return (
          <Card
            key={plan.id}
            className={cn(
              'relative p-6 flex flex-col',
              plan.popular && 'border-primary shadow-lg',
              isCurrentPlan && 'bg-primary/5'
            )}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-white">
                Most Popular
              </Badge>
            )}

            {isCurrentPlan && (
              <Badge className="absolute -top-3 right-4 bg-slate-900 hover:bg-slate-900 text-white border-slate-800 px-3 py-1 font-medium shadow-sm">
                Current Plan
              </Badge>
            )}

            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex-1 space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check
                    className={cn(
                      'h-5 w-5 mt-0.5 flex-shrink-0',
                      feature.included ? 'text-primary' : 'text-muted-foreground/30'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm',
                      feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                    )}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button
              variant={plan.popular ? 'default' : 'outline'}
              className={plan.popular ? 'w-full text-white' : 'w-full'}
              disabled={isCurrentPlan || upgradeMutation.isPending}
              onClick={() => handlePlanSelect(plan.id, plan.name)}
            >
              {isCurrentPlan ? 'Current Plan' : plan.cta}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
