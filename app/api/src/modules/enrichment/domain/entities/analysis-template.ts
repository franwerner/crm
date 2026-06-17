export interface AnalysisTemplateProps {
  readonly id: string
  readonly name: string
  readonly rubro: string
  readonly prompt: string
  readonly modelProvider: string
  readonly version: number
  readonly isActive: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null
}

export class AnalysisTemplate {
  private readonly props: AnalysisTemplateProps

  private constructor(props: AnalysisTemplateProps) {
    this.props = props
  }

  static create(params: {
    id: string
    name: string
    rubro: string
    prompt: string
    modelProvider: string
    createdAt: Date
    updatedAt: Date
  }): AnalysisTemplate {
    return new AnalysisTemplate({
      id: params.id,
      name: params.name,
      rubro: params.rubro,
      prompt: params.prompt,
      modelProvider: params.modelProvider,
      version: 1,
      isActive: true,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
      deletedAt: null,
    })
  }

  static reconstitute(props: AnalysisTemplateProps): AnalysisTemplate {
    return new AnalysisTemplate(props)
  }

  private withProps(patch: Partial<AnalysisTemplateProps>): AnalysisTemplate {
    return new AnalysisTemplate({ ...this.props, ...patch })
  }

  get id(): string { return this.props.id }
  get name(): string { return this.props.name }
  get rubro(): string { return this.props.rubro }
  get prompt(): string { return this.props.prompt }
  get modelProvider(): string { return this.props.modelProvider }
  get version(): number { return this.props.version }
  get isActive(): boolean { return this.props.isActive }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }
  get deletedAt(): Date | null { return this.props.deletedAt }

  update(patch: { name?: string; rubro?: string; prompt?: string; modelProvider?: string }, now: Date): AnalysisTemplate {
    return this.withProps({
      name: patch.name ?? this.props.name,
      rubro: patch.rubro ?? this.props.rubro,
      prompt: patch.prompt ?? this.props.prompt,
      modelProvider: patch.modelProvider ?? this.props.modelProvider,
      updatedAt: now,
    })
  }

  deactivate(now: Date): AnalysisTemplate {
    return this.withProps({ isActive: false, updatedAt: now })
  }
}
