import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * {{ComponentName}} component
 *
 * @description
 * Brief description of what this component does.
 *
 * @example
 * ```html
 * <app-{{component-name}}
 *   [data]="myData"
 *   (action)="onAction($event)"
 * />
 * ```
 */
@Component({
  selector: 'app-{{component-name}}',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './{{component-name}}.component.html',
  styleUrl: './{{component-name}}.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class {{ComponentName}}Component {
  // ============================================
  // Inputs
  // ============================================

  /**
   * Required data input
   */
  // data = input.required<DataType>();

  /**
   * Optional configuration
   */
  // config = input<Config>({ defaultValue: true });

  // ============================================
  // Outputs
  // ============================================

  /**
   * Emitted when action occurs
   */
  // action = output<ActionType>();

  // ============================================
  // Services
  // ============================================

  // private readonly myService = inject(MyService);

  // ============================================
  // Internal State
  // ============================================

  /**
   * Loading state
   */
  protected readonly loading = signal(false);

  /**
   * Error state
   */
  protected readonly error = signal<string | null>(null);

  // ============================================
  // Computed
  // ============================================

  /**
   * Derived value from inputs
   */
  // protected readonly derivedValue = computed(() => {
  //   return this.data().someProperty;
  // });

  // ============================================
  // Lifecycle
  // ============================================

  // ngOnInit(): void {
  //   // Initialization logic
  // }

  // ============================================
  // Event Handlers
  // ============================================

  /**
   * Handle action event
   */
  // protected onAction(): void {
  //   this.action.emit();
  // }

  // ============================================
  // Private Methods
  // ============================================

  // private processData(): void {
  //   // Internal processing
  // }
}
