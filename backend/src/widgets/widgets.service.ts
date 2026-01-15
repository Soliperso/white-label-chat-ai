import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateWidgetDto, UpdateWidgetDto } from './dto';
import { SupabaseService } from '../auth/supabase.service';

export interface Widget {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: 'active' | 'draft' | 'inactive';
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  fontFamily: string;
  whiteLabel: boolean;
  welcomeMessage: string;
  fallbackMessage: string;
  confidenceThreshold: number;
  collectEmail: boolean;
  showTypingIndicator: boolean;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  buttonSize: number;
  chatWindowWidth: number;
  chatWindowHeight: number;
  totalConversations: number;
  totalMessages: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class WidgetsService {
  private readonly logger = new Logger(WidgetsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(organizationId: string): Promise<Widget[]> {
    this.logger.log(`Fetching widgets for organization ${organizationId}`);
    const supabase = this.supabaseService.getClient();

    const { data: widgets, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('organizationId', organizationId)
      .order('createdAt', { ascending: false });

    if (error) {
      this.logger.error(`Failed to fetch widgets: ${error.message}`);
      throw new Error(`Failed to fetch widgets: ${error.message}`);
    }

    return (widgets as Widget[]) || [];
  }

  async findOne(id: string, organizationId: string): Promise<Widget> {
    const supabase = this.supabaseService.getClient();

    const { data: widget, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('id', id)
      .eq('organizationId', organizationId)
      .single();

    if (error || !widget) {
      throw new NotFoundException(`Widget with ID ${id} not found`);
    }

    return widget as Widget;
  }

  async create(dto: CreateWidgetDto, organizationId: string): Promise<Widget> {
    this.logger.log(`Creating widget for organization ${organizationId}`);
    const supabase = this.supabaseService.getClient();

    const widgetData = {
      organizationId,
      name: dto.name,
      description: dto.description,
      status: dto.status || 'draft',
      primaryColor: dto.primaryColor || '#4F46E5',
      accentColor: dto.accentColor || '#9333EA',
      logoUrl: dto.logoUrl,
      fontFamily: dto.fontFamily || 'Arial, sans-serif',
      whiteLabel: dto.whiteLabel || false,
      welcomeMessage: dto.welcomeMessage || 'Hi! How can I help you today?',
      fallbackMessage: dto.fallbackMessage || "I'm sorry, I don't know how to answer that.",
      confidenceThreshold: dto.confidenceThreshold || 0.7,
      collectEmail: dto.collectEmail !== undefined ? dto.collectEmail : true,
      showTypingIndicator: dto.showTypingIndicator !== undefined ? dto.showTypingIndicator : true,
      position: dto.position || 'bottom-right',
      buttonSize: dto.buttonSize || 60,
      chatWindowWidth: dto.chatWindowWidth || 400,
      chatWindowHeight: dto.chatWindowHeight || 600,
      totalConversations: 0,
      totalMessages: 0,
    };

    const { data: widget, error } = await supabase
      .from('widgets')
      .insert(widgetData)
      .select()
      .single();

    if (error || !widget) {
      this.logger.error(`Failed to create widget: ${error?.message}`);
      throw new Error(`Failed to create widget: ${error?.message}`);
    }

    return widget as Widget;
  }

  async update(id: string, dto: UpdateWidgetDto, organizationId: string): Promise<Widget> {
    await this.findOne(id, organizationId);

    const supabase = this.supabaseService.getClient();

    const { data: widget, error } = await supabase
      .from('widgets')
      .update(dto)
      .eq('id', id)
      .eq('organizationId', organizationId)
      .select()
      .single();

    if (error || !widget) {
      this.logger.error(`Failed to update widget: ${error?.message}`);
      throw new Error(`Failed to update widget: ${error?.message}`);
    }

    return widget as Widget;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    await this.findOne(id, organizationId);

    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('widgets')
      .delete()
      .eq('id', id)
      .eq('organizationId', organizationId);

    if (error) {
      this.logger.error(`Failed to delete widget: ${error.message}`);
      throw new Error(`Failed to delete widget: ${error.message}`);
    }

    this.logger.log(`Deleted widget ${id}`);
  }
}
